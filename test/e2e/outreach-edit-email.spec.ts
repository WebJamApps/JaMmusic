import { createHash } from 'node:crypto';
import { test, expect, type Page } from '@playwright/test';

const venues = [
  {
    _id: 'venue-a',
    name: 'First Venue',
    city: 'Salem',
    usState: 'VA',
    venueType: 'Originals',
    email: 'first@example.com',
    lastPitchDate: '2026-10-10T12:00:00.000Z',
  },
  {
    _id: 'venue-b',
    name: 'Second Venue',
    city: 'Roanoke',
    usState: 'VA',
    venueType: 'Originals',
    email: 'second@example.com',
  },
];

const drafts = venues.map((venue) => ({
  venueId: venue._id,
  venueName: venue.name,
  subject: `Booking at ${venue.name}`,
  body: `<p>Hi there,</p><p>Complete email for ${venue.name} for March 19-21, spring 2027.</p><p>Thanks — Josh</p>`,
}));

const customDraft = {
  venueId: 'venue-a',
  venueName: 'First Venue',
  subject: 'Booking at First Venue',
  body: '<p>Custom Opening for First Venue</p><p>Custom Extra paragraph text.</p><p>Thanks — Josh</p>',
};

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

test('admin edits one email preview, holds send until rebuilt, and sends with venueCustomizations', async ({ page, context }) => {
  await context.addInitScript(() => {
    localStorage.setItem('auth', JSON.stringify({
      isAuthenticated: true,
      error: '',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImV4cCI6OTk5OTk5OTk5OX0.signature',
      user: { userType: 'Developer', email: 'admin@example.com' },
    }));
  });
  await page.routeWebSocket(/.*/, (ws) => ws.close());
  await page.route(/^https:\/\//, (route) => route.abort());

  const writes: { path: string; body: Record<string, unknown> }[] = [];
  let chunks = 0;

  await page.route('http://localhost:7000/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();
    if (method === 'POST') {
      writes.push({ path, body: route.request().postDataJSON() as Record<string, unknown> });
    }
    let body: unknown = [];
    let status = 200;

    if (path === '/user/user-123') {
      body = { userType: 'Developer', email: 'admin@example.com' };
    } else if (path === '/venue' || path === '/outreach/candidates') {
      body = venues;
    } else if (path.startsWith('/outreach/approval/gate1')) {
      if (method === 'GET') {
        status = 404;
        body = { message: 'No stored approval' };
      } else {
        body = { ok: true };
      }
    } else if (path === '/outreach/approval/gate2') {
      body = { ok: true };
    } else if (path === '/outreach/preview') {
      const query = url.searchParams;
      expect(query.get('targetDates')).toBe('Mar 19-21');
      expect(query.get('bookingPeriod')).toBe('spring 2027');
      if (query.get('venueIds') === 'venue-a' && query.get('customIntro')) {
        body = [customDraft];
      } else {
        body = drafts;
      }
    } else if (path === '/outreach/batch/preflight') {
      body = { dispatchId: 'checked-dispatch-custom', venueCount: 2 };
    } else if (path === '/outreach/batch') {
      chunks += 1;
      body = { sent: 2, skipped: [], records: [], remaining: 0 };
    }
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });

  await selectWeekend(page);

  // Check that Pitched date label appears for already-pitched venue-a
  await expect(page.getByTestId('outreach-pitched-venue-a')).toBeVisible();
  await expect(page.getByTestId('outreach-pitched-venue-a')).toContainText('Pitched');
  await expect(page.getByTestId('outreach-pitched-venue-a')).toContainText('no reply recorded');

  // Open review dialog
  await page.getByRole('button', { name: 'Approve venues and review emails', exact: true }).click();
  await expect(page.getByTestId('outreach-dialog')).toBeVisible();
  await expect(page.getByTestId('outreach-dialog-send')).toBeEnabled();

  // Verify initial rendered email frames
  const frameA = page.frameLocator('iframe[title="Email for First Venue"]');
  const frameB = page.frameLocator('iframe[title="Email for Second Venue"]');
  await expect(frameA.locator('body')).toContainText('Complete email for First Venue');
  await expect(frameB.locator('body')).toContainText('Complete email for Second Venue');

  // Click Edit on First Venue
  await page.getByTestId('edit-toggle-venue-a').click();
  await expect(page.getByTestId('edit-box-venue-a')).toBeVisible();

  // Type into Opening box
  await page.getByLabel('Opening').fill('Custom Opening for First Venue');
  await page.getByLabel('Extra paragraph').fill('Custom Extra paragraph text.');

  // Verify Approve all is disabled while edit box holds un-rebuilt text
  await expect(page.getByTestId('outreach-dialog-send')).toBeDisabled();

  // Click Update preview
  await page.getByTestId('update-preview-venue-a').click();

  // Verify only First Venue's email preview updated and Second Venue remained unchanged
  await expect(frameA.locator('body')).toContainText('Custom Opening for First Venue');
  await expect(frameA.locator('body')).toContainText('Custom Extra paragraph text.');
  await expect(frameB.locator('body')).toContainText('Complete email for Second Venue');

  // Verify Edited mark is visible for First Venue and absent for Second Venue
  await expect(page.getByTestId('edited-mark-venue-a')).toBeVisible();
  await expect(page.getByTestId('edited-mark-venue-a')).toHaveText('Edited');
  await expect(page.getByTestId('edited-mark-venue-b')).toHaveCount(0);

  // Verify Approve all is re-enabled
  await expect(page.getByTestId('outreach-dialog-send')).toBeEnabled();

  // Send batch
  await page.getByTestId('outreach-dialog-send').click();

  // Verify completion result
  await expect(page.getByTestId('outreach-result')).toContainText('Batch complete');
  expect(chunks).toBe(1);

  // Verify preflight write payload contained venueCustomizations
  const preflightWrite = writes.find((w) => w.path === '/outreach/batch/preflight');
  expect(preflightWrite).toBeDefined();
  expect(preflightWrite?.body).toMatchObject({
    venueIds: ['venue-a', 'venue-b'],
    venueCustomizations: [
      {
        venueId: 'venue-a',
        customIntro: 'Custom Opening for First Venue',
        customBody: 'Custom Extra paragraph text.',
      },
    ],
  });

  // Verify Gate 2 draft fingerprints covered the custom draft for venue-a and standard draft for venue-b
  const gate2Write = writes.find((w) => w.path === '/outreach/approval/gate2');
  expect(gate2Write).toBeDefined();
  expect(gate2Write?.body.draftFingerprints).toEqual([
    {
      venueId: 'venue-a',
      subject: customDraft.subject,
      fingerprint: createHash('sha256').update(`${customDraft.subject}\n\n${customDraft.body}`).digest('hex'),
    },
    {
      venueId: 'venue-b',
      subject: drafts[1].subject,
      fingerprint: createHash('sha256').update(`${drafts[1].subject}\n\n${drafts[1].body}`).digest('hex'),
    },
  ]);
});
