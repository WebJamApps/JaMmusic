import fs from 'node:fs';
import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import type { StackAuthFixture } from './global-setup';

function loadAuthFixture(): StackAuthFixture {
  const authFile = process.env.E2E_STACK_AUTH_FILE;
  if (!authFile) {
    throw new Error('E2E_STACK_AUTH_FILE is not set');
  }
  return JSON.parse(fs.readFileSync(authFile, 'utf8')) as StackAuthFixture;
}

async function seedAuth(context: BrowserContext, token: string, userType: string, email: string): Promise<void> {
  await context.addInitScript(
    ({ authToken, type, userEmail }) => {
      localStorage.setItem(
        'auth',
        JSON.stringify({
          isAuthenticated: true,
          error: '',
          token: authToken,
          user: { userType: type, email: userEmail },
        }),
      );
    },
    { authToken: token, type: userType, userEmail: email },
  );
}

async function hideTinyMceNotifications(page: Page): Promise<void> {
  await page.addStyleTag({
    content:
      '[role="region"][aria-label="Notifications"], .tox-notifications-container, .tox-notification '
      + '{ display: none !important; pointer-events: none !important; } '
      + 'html, body { max-width: 100vw !important; overflow-x: hidden !important; } '
      + '.MuiDialog-paper { max-width: calc(100vw - 32px) !important; margin: 16px !important; } '
      + '.tox-tinymce { max-width: 100% !important; min-width: 0 !important; '
      + 'max-height: 200px !important; overflow: hidden !important; } '
      + '.tox-toolbar__primary, .tox-toolbar-overlord { flex-wrap: wrap !important; } '
      + '.tox-editor-header { position: static !important; }',
  });
}

test.describe('Real-stack Gigs CRUD via SocketCluster', () => {
  test('creates, updates across reload, and deletes a gig through live WebJamSocketCluster', async ({
    context,
    page,
  }, testInfo) => {
    const auth = loadAuthFixture();
    await seedAuth(context, auth.admin.token, 'Developer', auth.admin.user.email);

    const uniqueSuffix = `${testInfo.project.name}-${Date.now()}`;
    const initialTickets = `Tix-${uniqueSuffix}`;
    const updatedTickets = `Upd-${uniqueSuffix}`;

    await page.goto('/music', { waitUntil: 'domcontentloaded' });
    await hideTinyMceNotifications(page);

    const createButton = page.locator('.showCreateDialog');
    await expect(createButton).toBeVisible();
    await createButton.click();

    const createDialog = page.getByRole('dialog', { name: 'Create New Gig' });
    await expect(createDialog).toBeVisible();

    const venueSearch = createDialog.getByRole('combobox', { name: '* Search Venues', exact: true });
    await venueSearch.click();
    const seededOption = page.getByRole('option', { name: auth.venues.active.name, exact: true });
    await expect(seededOption).toBeVisible();
    await seededOption.click();

    await createDialog.getByLabel('Tickets').fill(initialTickets);

    const submitCreate = createDialog.getByRole('button', { name: 'Create', exact: true });
    await expect(submitCreate).toBeEnabled();
    await submitCreate.click();

    await expect(createDialog).toBeHidden();
    const gigsContainer = page.locator('.gigsDiv');
    await expect(gigsContainer.getByText(initialTickets)).toBeVisible();

    // Click the created gig's tickets cell/text to open EditGigDialog (avoids anchor stopPropagation)
    await gigsContainer.getByText(initialTickets).click();
    const editDialog = page.getByRole('dialog', { name: 'Edit Gig' });
    await expect(editDialog).toBeVisible();

    await editDialog.getByLabel('Tickets').fill(updatedTickets);
    const submitUpdate = editDialog.getByRole('button', { name: 'Update', exact: true });
    await expect(submitUpdate).toBeEnabled();
    await submitUpdate.click();

    await expect(editDialog).toBeHidden();
    await expect(gigsContainer.getByText(updatedTickets)).toBeVisible();

    // Reload and verify update persisted in MongoDB via WebJamSocketCluster
    await page.reload({ waitUntil: 'domcontentloaded' });
    await hideTinyMceNotifications(page);
    await expect(gigsContainer.getByText(updatedTickets)).toBeVisible();

    // Delete the gig and verify removal persists across reload
    await gigsContainer.getByText(updatedTickets).click();
    await expect(editDialog).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await editDialog.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(editDialog).toBeHidden();
    await expect(gigsContainer.getByText(updatedTickets)).toHaveCount(0);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('.showCreateDialog')).toBeVisible();
    await expect(gigsContainer.getByText(auth.venues.active.name).first()).toBeVisible();
    await expect(gigsContainer.getByText(updatedTickets)).toHaveCount(0);
  });

  test('displays real socketError and preserves entered values when non-privileged user attempts create', async ({
    context,
    page,
  }, testInfo) => {
    const auth = loadAuthFixture();
    await seedAuth(context, auth.nonAdmin.token, 'Developer', auth.nonAdmin.user.email);

    const preservedTickets = `Denied-${testInfo.project.name}-${Date.now()}`;

    await page.goto('/music', { waitUntil: 'domcontentloaded' });
    await hideTinyMceNotifications(page);

    const createButton = page.locator('.showCreateDialog');
    await expect(createButton).toBeVisible();
    await createButton.click();

    const createDialog = page.getByRole('dialog', { name: 'Create New Gig' });
    await expect(createDialog).toBeVisible();

    const venueSearch = createDialog.getByRole('combobox', { name: '* Search Venues', exact: true });
    await venueSearch.click();
    const seededOption = page.getByRole('option', { name: auth.venues.active.name, exact: true });
    await expect(seededOption).toBeVisible();
    await seededOption.click();

    await createDialog.getByLabel('Tickets').fill(preservedTickets);
    await createDialog.getByLabel('Duration (hours)').fill('2');

    const submitCreate = createDialog.getByRole('button', { name: 'Create', exact: true });
    await expect(submitCreate).toBeEnabled();
    await submitCreate.click();

    const errorAlert = createDialog.getByRole('alert');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/missing capability gig:create|Not allowed/i);

    // Dialog stays open and form values remain preserved
    await expect(createDialog).toBeVisible();
    await expect(venueSearch).toHaveValue(auth.venues.active.name);
    await expect(createDialog.getByLabel('Tickets')).toHaveValue(preservedTickets);
    await expect(createDialog.getByLabel('Duration (hours)')).toHaveValue('2');
  });
});
