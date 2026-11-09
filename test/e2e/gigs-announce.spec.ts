import { test, expect } from '@playwright/test';
import { fixture } from './helpers/gig-fixture';

test.describe('Gigs Announce interaction', () => {
  test('opens Announce preview dialog, edits tags and image, confirms, and submits POST /gig/:id/announce', async ({ page }) => {
    await fixture(page);

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

    // Edit fields
    await venueTag.fill('custom_venue_tag');
    const imageUrl = dialog.getByLabel('Image URL');
    await imageUrl.fill('https://example.com/custom-promo.png');

    const confirmButton = dialog.getByRole('button', { name: 'Confirm', exact: true });
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
      imageUrl: 'https://example.com/custom-promo.png',
      userTags: ['chemmariasherman', 'custom_venue_tag'],
      collaborators: ['chemmariasherman'],
      locationId: '378590115336095',
    });
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
