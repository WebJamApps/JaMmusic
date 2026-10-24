import { createHash } from 'node:crypto';
import { test, expect, type Page } from '@playwright/test';

const venues = [
  { _id: 'venue-a', name: 'First Venue', city: 'Salem', usState: 'VA', venueType: 'Originals', email: 'first@example.com' },
  { _id: 'venue-b', name: 'Second Venue', city: 'Roanoke', usState: 'VA', venueType: 'Originals', email: 'second@example.com' },
];
const drafts = venues.map(venue => ({
  venueId: venue._id, venueName: venue.name, subject: `Booking at ${venue.name}`,
  body: `<p>Hi there,</p><p>Complete email for ${venue.name} for March 19-21, spring 2027.</p><p>Thanks — Josh</p>`,
}));

async function selectWeekend(page: Page) {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('/admin/outreach', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('admin-outreach-page')).toBeVisible();
  const date = page.getByRole('group', { name: 'Weekend (eligibility)' });
  await date.getByRole('spinbutton', { name: 'Month' }).fill('03');
  await date.getByRole('spinbutton', { name: 'Day' }).fill('19');
  await date.getByRole('spinbutton', { name: 'Year' }).fill('2027');
  await page.getByTestId('outreach-load').click();
  await expect(page.getByTestId('outreach-candidates')).toContainText('2 of 2');
}

for (const refusal of [false, true]) {
  const outcome = refusal ? 'sees the preflight refusal verbatim' : 'sends in checked chunks';
  test(`admin approves venues and full emails, then ${outcome}`, async ({ page, context }) => {
    await context.addInitScript(() => {
      localStorage.setItem('auth', JSON.stringify({
        isAuthenticated: true, error: '',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImV4cCI6OTk5OTk5OTk5OX0.signature',
        user: { userType: 'Developer', email: 'admin@example.com' },
      }));
    });
    await page.routeWebSocket(/.*/, ws => ws.close());
    await page.route(/^https:\/\//, route => route.abort());
    const writes: { path: string; body: Record<string, unknown> }[] = [];
    let chunks = 0;
    await page.route('http://localhost:7000/**', async route => {
      const path = new URL(route.request().url()).pathname;
      const method = route.request().method();
      if (method === 'POST') writes.push({ path, body: route.request().postDataJSON() as Record<string, unknown> });
      let body: unknown = [];
      let status = 200;
      if (path === '/user/user-123') body = { userType: 'Developer', email: 'admin@example.com' };
      else if (path === '/venue' || path === '/outreach/candidates') body = venues;
      else if (path.startsWith('/outreach/approval/gate1') && method === 'GET') {
        body = { batchId: '2027-03-19-to-2027-03-21', venueIds: ['venue-a'], approver: 'Josh' };
      }
      else if (path === '/outreach/preview') {
        const query = new URL(route.request().url()).searchParams;
        expect(query.get('targetDates')).toBe('Mar 19-21');
        expect(query.get('bookingPeriod')).toBe('spring 2027');
        body = drafts;
      }
      else if (path === '/outreach/batch/preflight') {
        status = refusal ? 403 : 200;
        body = refusal ? { message: 'Gate 2 copy changed; review every email again' } : { dispatchId: 'checked-dispatch', venueCount: 2 };
      }
      else if (path === '/outreach/batch') {
        chunks += 1;
        body = { sent: 1, skipped: [], records: [], remaining: chunks === 1 ? 1 : 0 };
      }
      await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    });

    await selectWeekend(page);
    await page.getByRole('button', { name: 'Approve venues and review emails', exact: true }).click();
    await expect(page.getByTestId('stored-venue-approval')).toContainText('First Venue');
    await expect(page.getByRole('dialog')).toContainText('Second Venue');
    expect(writes).toHaveLength(0);
    await expect(page.getByTestId('outreach-dialog-send')).toBeDisabled();
    await page.getByTestId('outreach-confirm-venues').click();
    await expect(page.getByTestId('outreach-dialog-send')).toBeEnabled();
    expect(writes.map(write => write.path)).toEqual(['/outreach/approval/gate1']);
    for (const draft of drafts) {
      const frame = page.frameLocator(`iframe[title="Email for ${draft.venueName}"]`);
      await expect(frame.locator('body')).toContainText(`Complete email for ${draft.venueName}`);
      await expect(frame.locator('body')).toHaveCSS('background-color', 'rgb(18, 18, 20)');
      await expect(page.locator(`iframe[title="Email for ${draft.venueName}"]`)).toHaveAttribute('sandbox', 'allow-same-origin');
    }
    await page.getByRole('button', { name: 'Approve all 2 emails and send' }).click();
    if (refusal) {
      await expect(page.getByTestId('preview-error')).toHaveText('Gate 2 copy changed; review every email again');
      expect(chunks).toBe(0);
      await expect(page.getByTestId('outreach-dialog-send')).toBeDisabled();
    } else {
      await expect(page.getByTestId('outreach-result')).toContainText('Batch complete');
      await expect(page.getByTestId('outreach-result')).toContainText('Sent 2 of 2');
      expect(chunks).toBe(2);
      expect(writes.filter(write => write.path === '/outreach/batch').map(write => write.body)).toEqual([
        { dispatchId: 'checked-dispatch' }, { dispatchId: 'checked-dispatch' },
      ]);
    }
    expect(writes.slice(0, 3).map(write => write.path)).toEqual([
      '/outreach/approval/gate1', '/outreach/approval/gate2', '/outreach/batch/preflight',
    ]);
    expect(writes[0].body).toMatchObject({ approver: 'Josh', venueIds: ['venue-a', 'venue-b'] });
    expect(writes[1].body.draftFingerprints).toEqual(drafts.map(draft => ({
      venueId: draft.venueId, subject: draft.subject,
      fingerprint: createHash('sha256').update(`${draft.subject}\n\n${draft.body}`).digest('hex'),
    })));
  });
}
