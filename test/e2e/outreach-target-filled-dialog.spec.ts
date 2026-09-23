import { test, expect } from '@playwright/test';

// The backend stores targetWeekend bounds as Dates, so /outreach/replies/pending returns them as
// full ISO strings. The target-filled dialog must show those dates, keep them locked (the backend
// refuses a different weekend), and send them back unchanged.
const storedWeekend = { start: '2026-11-06T00:00:00.000Z', end: '2026-11-08T00:00:00.000Z' };

test.describe('Admin Outreach target-filled dialog', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.addInitScript(() => {
      try {
        const authData = {
          isAuthenticated: true,
          error: '',
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImV4cCI6OTk5OTk5OTk5OX0.signature',
          user: {
            userType: 'Developer',
            email: 'joshua@web-jam.com',
          },
        };
        localStorage.setItem('auth', JSON.stringify(authData));
      } catch { /* ignore */ }
    });

    await page.route(/\/user\/user-123/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ userType: 'Developer', email: 'joshua@web-jam.com' }),
      });
    });

    // Status-filtered outreach lists (booked, target-filled, sent) and templates: empty
    await page.route(/localhost:7000\/outreach(\/templates)?(\?.*)?$/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.route('http://localhost:7000/outreach/replies/pending*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            _id: 'r-iso',
            venueId: 'v-iso',
            status: 'replied',
            targetDates: 'Nov 6-8',
            targetWeekend: storedWeekend,
            sentAt: '2026-09-20T12:00:00.000Z',
          },
        ]),
      });
    });

    await page.route('http://localhost:7000/venue*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { _id: 'v-iso', name: 'Stored Weekend Venue', city: 'Salem', usState: 'VA', outreachEligible: true },
        ]),
      });
    });

    await page.route('http://localhost:7000/gig*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
  });

  test('shows the stored weekend locked and sends it back unchanged', async ({ page }) => {
    let outcomeBody: unknown = null;
    await page.route('http://localhost:7000/outreach/r-iso/outcome', async (route) => {
      outcomeBody = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    });

    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/admin/outreach', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="admin-outreach-page"]')).toBeVisible();

    const card = page.locator('[data-testid="reply-card-r-iso"]');
    await expect(card).toBeVisible();
    await card.locator('button').first().click();
    await page.locator('[data-testid="reply-target-filled-btn-r-iso"]').click();

    const dialog = page.locator('[data-testid="target-filled-dialog"]');
    await expect(dialog).toBeVisible();

    const startGroup = dialog.getByRole('group', { name: 'Weekend Start Date' });
    const endGroup = dialog.getByRole('group', { name: 'Weekend End Date' });
    await expect(startGroup.getByRole('spinbutton', { name: 'Month' })).toHaveText('11');
    await expect(startGroup.getByRole('spinbutton', { name: 'Day' })).toHaveText('06');
    await expect(startGroup.getByRole('spinbutton', { name: 'Year' })).toHaveText('2026');
    await expect(endGroup.getByRole('spinbutton', { name: 'Day' })).toHaveText('08');
    await expect(startGroup.getByRole('spinbutton', { name: 'Month' })).toHaveAttribute('aria-disabled', 'true');
    await expect(dialog.locator('[data-testid="target-filled-prompt"]'))
      .toContainText('This pitch was sent for the weekend below');

    await dialog.locator('[data-testid="target-filled-confirm-btn"]').click();
    await expect.poll(() => outcomeBody).toEqual({ status: 'target-filled', targetWeekend: storedWeekend });
  });
});
