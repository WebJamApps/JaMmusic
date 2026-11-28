import { test, expect, type Page } from '@playwright/test';
import { fixture } from './helpers/gig-fixture';

async function attachErrorCollectors(page: Page) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const tinyMceResponses: { url: string; status: number }[] = [];

  await page.addInitScript(() => {
    const win = window as unknown as { __cspViolations?: string[] };
    win.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (event) => {
      win.__cspViolations?.push(`${event.violatedDirective}:${event.blockedURI}`);
    });
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const locUrl = msg.location().url || '';
      const isExpectedAbortedExternal = /^https:\/\/(fonts\.googleapis\.com|use\.fontawesome\.com|accounts\.google\.com)\//.test(locUrl);
      if (!isExpectedAbortedExternal) {
        consoleErrors.push(`${msg.text()} (${locUrl || 'unknown'})`);
      }
    }
  });
  page.on('response', (res) => {
    if (res.url().includes('/tinymce/')) {
      tinyMceResponses.push({ url: res.url(), status: res.status() });
    }
  });

  return {
    tinyMceResponses,
    assertClean: async () => {
      const cspViolations = await page.evaluate(() => (window as unknown as { __cspViolations?: string[] }).__cspViolations ?? []);
      expect(cspViolations).toEqual([]);
      expect(pageErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
      expect(tinyMceResponses.length).toBeGreaterThan(0);
      expect(tinyMceResponses.some((r) => r.url.endsWith('/tinymce/tinymce.min.js'))).toBe(true);
      for (const res of tinyMceResponses) {
        expect(res.status).toBeLessThan(400);
      }
    },
  };
}

test.describe('Gigs Announce interaction', () => {
  test(
    'opens Announce preview dialog, edits caption in self-hosted TinyMCE, guards image URL, and submits POST /gig/:id/announce',
    async ({ page }) => {
    const collector = await attachErrorCollectors(page);
    await fixture(page);

    const announceWrites: Record<string, unknown>[] = [];
    const tinyGif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

    await page.route('**/gig/promo-default.jpg', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'image/gif',
        body: tinyGif,
        headers: { 'access-control-allow-origin': '*' },
      });
    });

    await page.route('**/custom-promo.png**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'image/gif',
        body: tinyGif,
        headers: { 'access-control-allow-origin': '*' },
      });
    });

    await page.route('**/venue/existing', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          _id: 'existing',
          name: 'Existing Hall',
          instagramUsername: 'existing_hall_ig',
          website: 'https://existinghall.com',
          facebookPageId: '378590115336095',
        },
        headers: { 'access-control-allow-origin': '*' },
      });
    });

    await page.route('**/gig/gig1/announce', async (route) => {
      if (route.request().method() === 'POST') {
        announceWrites.push(route.request().postDataJSON() as Record<string, unknown>);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          json: { ok: true, instagram: { ok: true, id: 'ig-12345' } },
          headers: { 'access-control-allow-origin': '*' },
        });
      } else {
        await route.abort();
      }
    });

    const announceButton = page.getByRole('button', { name: 'Announce', exact: true });
    await expect(announceButton).toBeVisible();
    await announceButton.click();

    const dialog = page.getByRole('dialog', { name: 'Announce Gig to Instagram' });
    await expect(dialog).toBeVisible();

    // Verify self-hosted TinyMCE loads cleanly inside iframe with no license/disabled error banner
    const editorBody = dialog.frameLocator('.tox-edit-area iframe').locator('body#tinymce');
    await expect(editorBody).toBeVisible();
    await expect(dialog.locator('.tox-notification--error')).toHaveCount(0);

    await editorBody.click();
    await editorBody.press('End');
    await editorBody.pressSequentially(' Edited via TinyMCE!');

    const mariaTag = dialog.getByLabel('Maria Sherman Instagram Tag');
    await expect(mariaTag).toHaveValue('chemmariasherman');

    const venueTag = dialog.getByLabel('Venue Instagram Tag');
    await expect(venueTag).toHaveValue('existing_hall_ig');

    const collaborator = dialog.getByLabel('Collaborator');
    await expect(collaborator).toHaveValue('chemmariasherman');

    const location = dialog.getByLabel('Location');
    await expect(location).toHaveValue('378590115336095');

    // Prior to Confirm, Facebook controls are not shown
    await expect(dialog.getByRole('button', { name: 'Copy caption', exact: true })).not.toBeVisible();

    // Edit fields and verify inline promoImageUrl validation + Dropbox normalization
    await venueTag.fill('custom_venue_tag');
    const imageUrl = dialog.getByLabel('Image URL');
    const confirmButton = dialog.getByRole('button', { name: 'Confirm', exact: true });

    await imageUrl.fill('not-a-valid-url');
    await expect(confirmButton).toBeDisabled();
    await expect(dialog.getByText('Enter a valid http:// or https:// image URL, or leave blank for the default photo.')).toBeVisible();

    await imageUrl.fill('https://dl.dropboxuser.com/scl/fi/test/custom-promo.png?dl=0');
    await expect(confirmButton).toBeEnabled();
    await confirmButton.click();

    const statusBanner = dialog.getByRole('status');
    await expect(statusBanner).toBeVisible();
    await expect(statusBanner).toContainText('Gig announced successfully to Instagram!');

    // Facebook hand-off controls appear after Instagram succeeds
    await expect(dialog.getByRole('button', { name: 'Copy caption', exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Download picture', exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Open Facebook', exact: true })).toBeVisible();

    expect(announceWrites).toHaveLength(1);
    expect(announceWrites[0]).toMatchObject({
      imageUrl: 'https://dl.dropboxusercontent.com/scl/fi/test/custom-promo.png?dl=0',
      userTags: ['chemmariasherman', 'custom_venue_tag'],
      collaborators: ['chemmariasherman'],
      locationId: '378590115336095',
    });
    expect(String(announceWrites[0].caption)).toContain('Edited via TinyMCE!');
    await collector.assertClean();
  });

  test('picture strip thumbnail selection populates image URL and retains Facebook hand-off', async ({ page }) => {
    await fixture(page);

    const tinyGif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    await page.route('**/gig/promo-default.jpg', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'image/gif',
        body: tinyGif,
        headers: { 'access-control-allow-origin': '*' },
      });
    });

    const announceWrites: Record<string, unknown>[] = [];

    await page.route('**/venue/existing', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          _id: 'existing',
          name: 'Existing Hall',
          instagramUsername: 'existing_hall_ig',
          website: 'https://existinghall.com',
          facebookPageId: '378590115336095',
        },
        headers: { 'access-control-allow-origin': '*' },
      });
    });

    await page.route('**/gig/gig1/announce', async (route) => {
      if (route.request().method() === 'POST') {
        announceWrites.push(route.request().postDataJSON() as Record<string, unknown>);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          json: { ok: true, instagram: { ok: true, id: 'ig-12345' } },
          headers: { 'access-control-allow-origin': '*' },
        });
      } else {
        await route.abort();
      }
    });

    const announceButton = page.getByRole('button', { name: 'Announce', exact: true });
    await expect(announceButton).toBeVisible();
    await announceButton.click();

    const dialog = page.getByRole('dialog', { name: 'Announce Gig to Instagram' });
    await expect(dialog).toBeVisible();

    const strip = dialog.getByTestId('announce-picture-strip');
    await expect(strip).toBeVisible();

    const defaultThumbnail = dialog.getByTestId('picture-strip-item-0');
    await expect(defaultThumbnail).toBeVisible();
    await defaultThumbnail.click();

    const imageUrlInput = dialog.getByLabel('Image URL');
    await expect(imageUrlInput).toHaveValue(/promo-default\.jpg/);

    const confirmButton = dialog.getByRole('button', { name: 'Confirm', exact: true });
    await expect(confirmButton).toBeEnabled();
    await confirmButton.click();

    const statusBanner = dialog.getByRole('status');
    await expect(statusBanner).toBeVisible();
    await expect(statusBanner).toContainText('Gig announced successfully to Instagram!');

    // Facebook hand-off controls appear and remain usable
    await expect(dialog.getByRole('button', { name: 'Copy caption', exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Download picture', exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Open Facebook', exact: true })).toBeVisible();
    await expect(confirmButton).toBeDisabled();

    expect(announceWrites).toHaveLength(1);
    expect(announceWrites[0].imageUrl).toMatch(/promo-default\.jpg/);
  });

  test('displays "Posted without the location" message when announce response carries locationDropped', async ({ page }) => {
    await fixture(page);

    await page.route('**/venue/existing', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          _id: 'existing',
          name: 'Existing Hall',
          instagramUsername: 'existing_hall_ig',
          facebookPageId: '378590115336095',
        },
        headers: { 'access-control-allow-origin': '*' },
      });
    });

    await page.route('**/gig/gig1/announce', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          ok: true,
          instagram: {
            ok: true,
            id: 'ig-12345',
            locationDropped: 'Error 100: Invalid location ID',
          },
        },
        headers: { 'access-control-allow-origin': '*' },
      });
    });

    await page.getByRole('button', { name: 'Announce', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Announce Gig to Instagram' });
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'Confirm', exact: true }).click();

    const statusBanner = dialog.getByRole('status');
    await expect(statusBanner).toBeVisible();
    await expect(statusBanner).toContainText('Posted without the location: Instagram refused it: Error 100: Invalid location ID');

    // Facebook hand-off is also offered
    await expect(dialog.getByRole('button', { name: 'Copy caption', exact: true })).toBeVisible();
  });

  test('displays Instagram error message when announce POST fails', async ({ page }) => {
    await fixture(page);

    await page.route('**/venue/existing', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: { _id: 'existing', name: 'Existing Hall', instagramUsername: 'existing_hall_ig' },
        headers: { 'access-control-allow-origin': '*' },
      });
    });

    await page.route('**/gig/gig1/announce', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        json: { ok: false, instagram: { ok: false, error: 'Instagram token expired' } },
        headers: { 'access-control-allow-origin': '*' },
      });
    });

    await page.getByRole('button', { name: 'Announce', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Announce Gig to Instagram' });
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'Confirm', exact: true }).click();

    const statusBanner = dialog.getByRole('status');
    await expect(statusBanner).toBeVisible();
    await expect(statusBanner).toContainText('Instagram error: Instagram token expired');
    // Dialog remains open so administrator can retry or cancel
    await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeVisible();
  });

  test('canceling dialog closes preview without posting', async ({ page }) => {
    await fixture(page);

    let announceCalls = 0;
    await page.route('**/venue/existing', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: { _id: 'existing', name: 'Existing Hall' },
        headers: { 'access-control-allow-origin': '*' },
      });
    });

    await page.route('**/gig/gig1/announce', async (route) => {
      announceCalls += 1;
      await route.fulfill({ status: 200, json: { ok: true } });
    });

    await page.getByRole('button', { name: 'Announce', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Announce Gig to Instagram' });
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(dialog).not.toBeVisible();

    expect(announceCalls).toBe(0);
  });

  test('keyboard activation of Announce button opens preview and never Edit Gig', async ({ page }) => {
    await fixture(page);

    await page.route('**/venue/existing', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: { _id: 'existing', name: 'Existing Hall', instagramUsername: 'existing_hall_ig' },
        headers: { 'access-control-allow-origin': '*' },
      });
    });

    const announceBtn = page.getByRole('button', { name: 'Announce', exact: true }).first();
    await expect(announceBtn).toBeVisible();
    await announceBtn.focus();
    await page.keyboard.press('Enter');

    const announceDialog = page.getByRole('dialog', { name: 'Announce Gig to Instagram' });
    await expect(announceDialog).toBeVisible();

    const editDialog = page.getByRole('dialog', { name: 'Edit Gig' });
    await expect(editDialog).not.toBeVisible();
  });
});
