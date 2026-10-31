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

    expect(announceWrites).toHaveLength(1);
    expect(announceWrites[0]).toMatchObject({
      imageUrl: 'https://example.com/custom-promo.png',
      userTags: ['chemmariasherman', 'custom_venue_tag'],
    });
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
});
