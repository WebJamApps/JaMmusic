import fs from 'node:fs';
import { test, expect, type BrowserContext } from '@playwright/test';
import type { StackAuthFixture } from './global-setup';

function loadAuthFixture(): StackAuthFixture {
  const authFile = process.env.E2E_STACK_AUTH_FILE;
  if (!authFile) {
    throw new Error('E2E_STACK_AUTH_FILE is not set');
  }
  return JSON.parse(fs.readFileSync(authFile, 'utf8')) as StackAuthFixture;
}

async function seedAdminAuth(context: BrowserContext, auth: StackAuthFixture): Promise<void> {
  await context.addInitScript(
    ({ authToken, userEmail }) => {
      localStorage.setItem(
        'auth',
        JSON.stringify({
          isAuthenticated: true,
          error: '',
          token: authToken,
          user: { userType: 'Developer', email: userEmail },
        }),
      );
    },
    { authToken: auth.admin.token, userEmail: auth.admin.user.email },
  );
}

test.describe('Real-stack Venues CRUD via web-jam-back REST API', () => {
  test('creates, updates across reload, soft-deletes, and reveals via Show archived', async ({
    context,
    page,
  }, testInfo) => {
    const auth = loadAuthFixture();
    await seedAdminAuth(context, auth);

    const uniqueSuffix = `${testInfo.project.name}-${Date.now()}`;
    const venueName = `Stack Venue ${uniqueSuffix}`;
    const venueEmail = `venue-${uniqueSuffix.toLowerCase()}@example.com`;

    await page.goto('/admin/venues', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('admin-venues-page')).toBeVisible();
    await expect(page.getByTestId('venues-table')).toBeVisible();

    // 1. Create (POST /venue)
    await page.getByTestId('admin-venues-add-button').click();
    await expect(page.getByTestId('edit-venue-dialog-title')).toHaveText('Add Venue');

    await page.getByTestId('edit-venue-name').locator('input').fill(venueName);
    await page.getByTestId('edit-venue-address').locator('input').fill('301 College Ave');
    await page.getByTestId('edit-venue-city').locator('input').fill('Salem');
    await page.getByTestId('edit-venue-state').click();
    await page.getByRole('option', { name: 'Virginia (VA)', exact: true }).click();
    await page.getByTestId('edit-venue-zip').locator('input').fill('24153');
    await page.getByTestId('edit-venue-email').locator('input').fill(venueEmail);

    const saveButton = page.getByTestId('edit-venue-save');
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    await expect(page.getByTestId('edit-venue-dialog-title')).toBeHidden();
    await expect(page.getByTestId('admin-venues-save-result')).toContainText('Venue created');

    const searchInput = page.getByTestId('venues-search-box').locator('input');
    await searchInput.fill(venueName);

    const createdRow = page.locator('tbody tr').filter({ hasText: venueName });
    await expect(createdRow).toHaveCount(1);
    await expect(createdRow).toContainText('Salem');

    // Reload and verify create persisted in MongoDB
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('venues-table')).toBeVisible();
    await page.getByTestId('venues-search-box').locator('input').fill(venueName);
    await expect(page.locator('tbody tr').filter({ hasText: venueName })).toHaveCount(1);

    // 2. Update (PATCH /venue/:id)
    await page.locator('tbody tr').filter({ hasText: venueName }).getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByTestId('edit-venue-dialog-title')).toHaveText(`Edit Venue — ${venueName}`);

    await page.getByTestId('edit-venue-city').locator('input').fill('Roanoke');
    await expect(page.getByTestId('edit-venue-save')).toBeEnabled();
    await page.getByTestId('edit-venue-save').click();

    await expect(page.getByTestId('edit-venue-dialog-title')).toBeHidden();
    await expect(page.getByTestId('admin-venues-save-result')).toContainText('Existing venue updated');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('venues-table')).toBeVisible();
    await page.getByTestId('venues-search-box').locator('input').fill(venueName);
    const updatedRow = page.locator('tbody tr').filter({ hasText: venueName });
    await expect(updatedRow).toHaveCount(1);
    await expect(updatedRow).toContainText('Roanoke');

    // 3. Soft-delete (DELETE /venue/:id) + "Show archived"
    page.once('dialog', (dialog) => dialog.accept());
    await updatedRow.getByRole('button', { name: 'Archive' }).click();

    await expect(page.getByTestId('venues-search-empty')).toBeVisible();

    await page.getByTestId('venues-show-archived-toggle').locator('input').click();
    await page.getByTestId('venues-search-box').locator('input').fill(venueName);
    const archivedRow = page.locator('tbody tr').filter({ hasText: venueName });
    await expect(archivedRow).toHaveCount(1);
    await expect(archivedRow.getByRole('button', { name: 'Restore' })).toBeVisible();
  });

  test('renders real backend HTTP 400 error in edit-venue-error while keeping dialog open', async ({
    context,
    page,
  }) => {
    const auth = loadAuthFixture();
    await seedAdminAuth(context, auth);

    await page.goto('/admin/venues', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('venues-table')).toBeVisible();

    await page.getByTestId('venues-search-box').locator('input').fill(auth.venues.active.name);
    const activeRow = page.locator('tbody tr').filter({ hasText: auth.venues.active.name });
    await expect(activeRow).toHaveCount(1);

    await activeRow.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByTestId('edit-venue-dialog-title')).toHaveText(`Edit Venue — ${auth.venues.active.name}`);

    // Non-integer gigInterval passes client-side checks and reaches PATCH /venue/:id,
    // where web-jam-back rejects it with HTTP 400.
    await page.getByTestId('edit-venue-giginterval').locator('input').fill('1.5');
    const saveButton = page.getByTestId('edit-venue-save');
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    const errorBanner = page.getByTestId('edit-venue-error');
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText('gigInterval must be a non-negative whole number of months');
    await expect(page.getByTestId('edit-venue-dialog-title')).toBeVisible();
  });
});
