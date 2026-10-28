import { test, expect, type Page, type Locator } from '@playwright/test';
import { fixture, openGigDialog } from './helpers/gig-fixture';

const suggestion = '123 Campbell Ave, Roanoke';
async function openNewVenue(page: Page, mode: 'create' | 'edit') {
  const dialog = await openGigDialog(page, mode);
  await dialog.getByLabel('Create New Venue', { exact: true }).check();
  await dialog.getByLabel('* Venue Name', { exact: true }).fill('Lookup Hall');
  return dialog;
}
const address = (dialog: Locator) => dialog.getByRole('combobox', { name: '* Street Address', exact: true });
const submit = (dialog: Locator, mode: 'create' | 'edit') => dialog.getByRole('button', {
  name: mode === 'create' ? 'Create' : 'Update', exact: true,
});
async function choose(page: Page, dialog: Locator) {
  await address(dialog).fill('123 Campbell');
  await expect(page.getByRole('option', { name: suggestion })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Google Maps' })).toBeVisible();
  await page.getByRole('option', { name: suggestion }).click();
}
async function manualParts(dialog: Locator) {
  await dialog.getByLabel('* City', { exact: true }).fill('Salem');
  await dialog.getByLabel('* State', { exact: true }).click();
  await dialog.page().getByRole('option', { name: 'Virginia', exact: true }).click();
  await dialog.getByLabel('* Zip Code', { exact: true }).fill('24153');
}
function deferred() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => { release = resolve; });
  return { promise, release };
}

for (const mode of ['create', 'edit'] as const) {
  test(`${mode}: suggestions fill editable fields and save exact coordinates through the common lookup`, async ({ page }) => {
    const { venueWrites, gigWrites, reads, googleRequests } = await fixture(page);
    const dialog = await openNewVenue(page, mode);
    await choose(page, dialog);
    await expect(address(dialog)).toHaveValue('123 Campbell Ave');
    await expect(dialog.getByLabel('* City', { exact: true })).toHaveValue('Roanoke');
    await expect(dialog.getByLabel('* State', { exact: true })).toHaveText('North Carolina');
    await expect(dialog.getByLabel('* Zip Code', { exact: true })).toHaveValue('24011');
    await dialog.getByLabel('Website', { exact: true }).fill('hall.example.com');
    const session = reads[0].url.searchParams.get('sessionToken');
    expect(session).toMatch(/^[\da-f-]{36}$/i);
    expect(reads[1].url.searchParams.get('sessionToken')).toBe(session);
    expect(reads.every((read) => read.authorization?.startsWith('Bearer '))).toBe(true);
    await page.screenshot({ path: `/tmp/jammusic-1395-${mode}-lookup.png`, fullPage: true });
    await submit(dialog, mode).click();
    await expect(dialog).not.toBeVisible();
    expect(venueWrites[0]).toMatchObject({
      address: '123 Campbell Ave', city: 'Roanoke', usState: 'NC', zipCode: '24011',
      website: 'https://hall.example.com', location: { type: 'Point', coordinates: [-79.94, 37.27] },
    });
    expect(gigWrites[0].data?.gig?.venueId).toBe('archivedHall');
    expect(googleRequests).toEqual([]);
  });

  for (const scenario of [
    { name: 'not configured', suggestionStatus: 503, suggestions: { message: 'Address lookup is not configured' } },
    { name: 'service failure', suggestionStatus: 502 },
    { name: 'no suggestions', suggestions: [] },
  ]) {
    test(`${mode}: retained typed entry saves with ${scenario.name}`, async ({ page }) => {
      const { venueWrites } = await fixture(page, scenario);
      const dialog = await openNewVenue(page, mode);
      await address(dialog).fill('999 Manual St');
      await expect(dialog.getByText(/enter the address manually/)).toBeVisible();
      await expect(address(dialog)).toHaveValue('999 Manual St');
      await manualParts(dialog);
      await submit(dialog, mode).click();
      await expect(dialog).not.toBeVisible();
      expect(venueWrites[0]).toMatchObject({ address: '999 Manual St', city: 'Salem', zipCode: '24153' });
      expect(venueWrites[0]).not.toHaveProperty('location');
    });
  }

  test(`${mode}: details failure leaves all typed values available for manual save`, async ({ page }) => {
    const { venueWrites } = await fixture(page, { detailStatus: 502 });
    const dialog = await openNewVenue(page, mode);
    await manualParts(dialog);
    await choose(page, dialog);
    await expect(dialog.getByText(/enter the address manually/)).toBeVisible();
    await expect(address(dialog)).toHaveValue('123 Campbell');
    await expect(dialog.getByLabel('* City', { exact: true })).toHaveValue('Salem');
    await submit(dialog, mode).click();
    await expect(dialog).not.toBeVisible();
    expect(venueWrites[0]).not.toHaveProperty('location');
  });

  test(`${mode}: missing components remain required and later edits remove the pin`, async ({ page }) => {
    const { venueWrites } = await fixture(page, { details: { street: '1 Main St', lat: 37.27, lng: -79.94 } });
    const dialog = await openNewVenue(page, mode);
    await choose(page, dialog);
    await expect(address(dialog)).toHaveValue('1 Main St');
    await expect(submit(dialog, mode)).toBeDisabled();
    await manualParts(dialog);
    await address(dialog).fill('9 Corrected St');
    await submit(dialog, mode).click();
    await expect(dialog).not.toBeVisible();
    expect(venueWrites[0]).toMatchObject({ address: '9 Corrected St', city: 'Salem', zipCode: '24153' });
    expect(venueWrites[0]).not.toHaveProperty('location');
  });

  test(`${mode}: older suggestions cannot replace a newer search`, async ({ page }) => {
    const old = deferred();
    const { reads } = await fixture(page, { holdOldSearch: old.promise });
    const dialog = await openNewVenue(page, mode);
    await address(dialog).fill('Old street');
    await expect.poll(() => reads.length).toBe(1);
    await address(dialog).fill('123 Campbell');
    await expect(page.getByRole('option', { name: suggestion })).toBeVisible();
    old.release();
    await page.getByRole('option', { name: suggestion }).click();
    await expect(address(dialog)).toHaveValue('123 Campbell Ave');
    await expect(page.getByRole('option', { name: 'Obsolete suggestion' })).toHaveCount(0);
  });

  test(`${mode}: a manual edit wins over pending details`, async ({ page }) => {
    const pending = deferred();
    const { reads, venueWrites } = await fixture(page, { holdDetails: pending.promise });
    const dialog = await openNewVenue(page, mode);
    await choose(page, dialog);
    await expect.poll(() => reads.length).toBe(2);
    await address(dialog).fill('9 My address');
    await manualParts(dialog);
    pending.release();
    await submit(dialog, mode).click();
    await expect(dialog).not.toBeVisible();
    expect(venueWrites[0]).toMatchObject({ address: '9 My address', city: 'Salem', zipCode: '24153' });
    expect(venueWrites[0]).not.toHaveProperty('location');
  });
}
