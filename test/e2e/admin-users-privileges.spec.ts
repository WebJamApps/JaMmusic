import { test, expect } from '@playwright/test';

// Guards the AdminUsers privileges picker against the two layout regressions found
// reviewing JaMmusic#1362, plus the Outreach approve-block itself. The unit specs
// assert which controls render and what gets sent; only a real browser can prove
// the row actually fits on a phone and that no control is pushed off-screen.

const AGENT_USER = {
  _id: 'u-agent',
  name: 'Web Jam LLM',
  email: 'agent@web-jam.com',
  userType: 'web-jam-llm',
  userStatus: 'ai-agent',
  privileges: ['gig:create', 'outreach:create', 'outreach:approve'],
};

const HUMAN_USER = {
  _id: 'u-human',
  name: 'Josh Sherman',
  email: 'josh@web-jam.com',
  userType: 'JaM-admin',
  userStatus: 'human',
  privileges: ['gig:create'],
};

test.describe('AdminUsers privileges picker', () => {
  test.beforeEach(async ({ context, page }) => {
    // Seed localStorage to simulate a logged-in Developer/Admin user
    await context.addInitScript(() => {
      try {
        localStorage.setItem('auth', JSON.stringify({
          isAuthenticated: true,
          error: '',
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImV4cCI6OTk5OTk5OTk5OX0.signature',
          user: { userType: 'Developer', email: 'joshua@web-jam.com' },
        }));
      } catch { /* ignore */ }
    });

    await page.route(/\/user\/user-123/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ userType: 'Developer', email: 'joshua@web-jam.com' }),
      });
    });

    await page.route('http://localhost:7000/admin/user*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([AGENT_USER, HUMAN_USER]),
      });
    });
  });

  test('every capability group keeps its checkboxes on-screen at phone width', async ({ page }) => {
    await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="admin-users-page"]')).toBeVisible();

    // The create form carries the same picker as the edit dialog, and is always mounted.
    // These rows sit well down a long page, so scroll each into view first — toBeInViewport
    // checks the current scroll position, not just horizontal fit — then assert it lands
    // fully inside the viewport width with nothing clipped off the right edge.
    for (const cap of ['outreach:approve', 'promo:email', 'venue-mining:create', 'tour:delete']) {
      const box = page.locator(`[data-testid="create-cap-${cap}"]`);
      await expect(box).toBeAttached();
      await box.scrollIntoViewIfNeeded();
      await expect(box).toBeInViewport({ ratio: 1 });
    }

    // Nothing in the picker may overflow the page horizontally — the old nowrap rows
    // pushed the Outreach `approve` column clear off the right edge on a phone.
    const overflow = await page.evaluate(() => {
      const el = document.documentElement;
      return el.scrollWidth - el.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('Promotion renders its lone checkbox beside its label, not four empty columns away', async ({ page }) => {
    await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="admin-users-page"]')).toBeVisible();

    const label = page.getByText('Promotion', { exact: true });
    await expect(label).toBeVisible();
    const labelBox = await label.boundingBox();
    const emailBox = await page.locator('[data-testid="create-cap-promo:email"]').boundingBox();

    expect(labelBox).not.toBeNull();
    expect(emailBox).not.toBeNull();
    if (labelBox && emailBox) {
      // Promotion has no CRUD member. Before the fix, four 100px placeholder columns sat
      // between the label and `email`; the checkbox now starts within one column of it.
      const gap = emailBox.x - (labelBox.x + labelBox.width);
      expect(gap).toBeLessThan(100);
    }
  });

  test('an AI-agent account shows approve disabled, captioned, and fully visible', async ({ page }) => {
    await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="edit-priv-u-agent"]').click();

    const approve = page.locator('[data-testid="edit-cap-outreach:approve"]');
    await expect(approve).toBeAttached();
    await expect(approve).toBeDisabled();
    await expect(approve).not.toBeChecked();

    const caption = page.locator('[data-testid="edit-approve-helper-text"]');
    await expect(caption).toBeVisible();
    await expect(caption).toHaveText('AI agents may draft but never send');

    // The caption used to sit inline with `whiteSpace: nowrap`, widening the row past the
    // sm-width dialog. Both it and the checkbox must now be reachable without scrolling sideways —
    // scroll each into the dialog's own scroll container first, since toBeInViewport checks the
    // current scroll position and this dialog is taller than the viewport.
    await approve.scrollIntoViewIfNeeded();
    await expect(approve).toBeInViewport({ ratio: 1 });
    await caption.scrollIntoViewIfNeeded();
    await expect(caption).toBeInViewport({ ratio: 1 });

    const dialogOverflow = await page.locator('.MuiDialogContent-root').evaluate(
      (el) => el.scrollWidth - el.clientWidth,
    );
    expect(dialogOverflow).toBeLessThanOrEqual(1);
  });

  test('a human account shows approve enabled and uncaptioned', async ({ page }) => {
    await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="edit-priv-u-human"]').click();

    const approve = page.locator('[data-testid="edit-cap-outreach:approve"]');
    await expect(approve).toBeAttached();
    await expect(approve).toBeEnabled();
    await expect(page.locator('[data-testid="edit-approve-helper-text"]')).toHaveCount(0);

    await approve.check({ force: true });
    await expect(approve).toBeChecked();
  });

  test('clearing Type on an agent account clears the web-jam-llm role with it', async ({ page }) => {
    await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="edit-priv-u-agent"]').click();

    const roleSelect = page.getByRole('combobox', { name: 'Role' });
    await expect(roleSelect).toHaveText('web-jam-llm');

    await page.getByRole('combobox', { name: 'Type' }).click();
    await page.getByRole('option', { name: 'None', exact: true }).click();

    // `web-jam-llm` is filtered out of the Role options whenever the status is not
    // `ai-agent`, so the role must clear rather than leave the select showing a blank
    // field that still holds it — and later save a role/status pair the backend rejects.
    await expect(roleSelect).toHaveText('');
  });
});
