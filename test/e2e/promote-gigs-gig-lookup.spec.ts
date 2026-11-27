import { test, expect, type Page, type Locator } from '@playwright/test';
import { fixture, openGigDialog } from './helpers/gig-fixture';

const optionLabel = 'Lookup Hall — 123 Campbell Ave, Roanoke';
async function openNewVenue(page: Page, mode: 'create' | 'edit') {
  const dialog = await openGigDialog(page, mode);
  await dialog.getByLabel('Create New Venue', { exact: true }).check();
  return dialog;
}
const venueName = (dialog: Locator) => dialog.getByRole('combobox', { name: '* Venue Name', exact: true });
const submit = (dialog: Locator, mode: 'create' | 'edit') => dialog.getByRole('button', {
  name: mode === 'create' ? 'Create' : 'Update', exact: true,
});
async function choose(page: Page, dialog: Locator, label = optionLabel) {
  await venueName(dialog).fill('Lookup');
  await expect(page.getByRole('option', { name: label })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Google Maps' })).toHaveCount(0);
  await page.getByRole('option', { name: label }).click();
}
async function manualParts(dialog: Locator) {
  await dialog.getByLabel('* Street Address', { exact: true }).fill('999 Manual St');
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
  test(`${mode}: listings fill editable fields, website, and save exact coordinates`, async ({ page }) => {
    const { venueWrites, gigWrites, reads, googleRequests } = await fixture(page);
    const dialog = await openNewVenue(page, mode);
    await choose(page, dialog);
    await expect(venueName(dialog)).toHaveValue('Lookup Hall');
    await expect(dialog.getByLabel('* Street Address', { exact: true })).toHaveValue('123 Campbell Ave');
    await expect(dialog.getByLabel('* City', { exact: true })).toHaveValue('Roanoke');
    await expect(dialog.getByLabel('* State', { exact: true })).toHaveText('North Carolina');
    await expect(dialog.getByLabel('* Zip Code', { exact: true })).toHaveValue('24011');
    await expect(dialog.getByLabel('Website', { exact: true })).toHaveValue('https://listing.example.com');
    expect(reads).toHaveLength(1);
    expect(reads[0].url.searchParams.get('q')).toBe('Lookup');
    expect(reads[0].authorization?.startsWith('Bearer ')).toBe(true);
    await submit(dialog, mode).click();
    await expect(dialog).not.toBeVisible();
    expect(venueWrites[0]).toMatchObject({
      name: 'Lookup Hall',
      address: '123 Campbell Ave',
      city: 'Roanoke',
      usState: 'NC',
      zipCode: '24011',
      website: 'https://listing.example.com',
      location: { type: 'Point', coordinates: [-79.94, 37.27] },
    });
    expect(gigWrites[0].data?.gig?.venueId).toBe('archivedHall');
    expect(googleRequests).toEqual([]);
  });

  test(`${mode}: keeps an already typed website as typed when selecting a listing`, async ({ page }) => {
    const { venueWrites } = await fixture(page);
    const dialog = await openNewVenue(page, mode);
    await dialog.getByLabel('Website', { exact: true }).fill('hall.example.com');
    await choose(page, dialog);
    await expect(dialog.getByLabel('Website', { exact: true })).toHaveValue('hall.example.com');
    await submit(dialog, mode).click();
    await expect(dialog).not.toBeVisible();
    expect(venueWrites[0].website).toBe('https://hall.example.com');
  });

  for (const scenario of [
    { name: 'not loaded', suggestionStatus: 503, suggestions: { message: 'Venue listings have not loaded yet' } },
    { name: 'service failure', suggestionStatus: 502 },
    { name: 'no matches', suggestions: [] },
  ]) {
    test(`${mode}: retained typed entry saves and shows no-position notice with ${scenario.name}`, async ({ page }) => {
      const { venueWrites } = await fixture(page, { ...scenario, noLocation: true });
      const dialog = await openNewVenue(page, mode);
      await venueName(dialog).fill('Manual Hall');
      await expect(dialog.getByText(/manually/)).toBeVisible();
      await expect(venueName(dialog)).toHaveValue('Manual Hall');
      await manualParts(dialog);
      await submit(dialog, mode).click();
      await expect(dialog).not.toBeVisible();
      expect(venueWrites[0]).toMatchObject({ name: 'Manual Hall', address: '999 Manual St', city: 'Salem', zipCode: '24153' });
      expect(venueWrites[0]).not.toHaveProperty('location');
      await expect(page.locator('.gigsDiv > [role="status"]'))
        .toContainText("Saved. No map position was found for this address, so this venue won't appear in Near searches.");
    });
  }

  test(`${mode}: missing components remain required and later edits remove the pin`, async ({ page }) => {
    const { venueWrites } = await fixture(page, {
      suggestions: [{
        listingId: 'l-min', name: 'Lookup Hall', street: '1 Main St', city: '', state: '', zipCode: '', website: '', lat: 37.27, lng: -79.94,
      }],
    });
    const dialog = await openNewVenue(page, mode);
    await choose(page, dialog, 'Lookup Hall — 1 Main St');
    await expect(dialog.getByLabel('* Street Address', { exact: true })).toHaveValue('1 Main St');
    await expect(submit(dialog, mode)).toBeDisabled();
    await manualParts(dialog);
    await submit(dialog, mode).click();
    await expect(dialog).not.toBeVisible();
    expect(venueWrites[0]).toMatchObject({ address: '999 Manual St', city: 'Salem', zipCode: '24153' });
    expect(venueWrites[0]).not.toHaveProperty('location');
  });

  test(`${mode}: older suggestions cannot replace a newer search`, async ({ page }) => {
    const old = deferred();
    const { reads } = await fixture(page, { holdOldSearch: old.promise });
    const dialog = await openNewVenue(page, mode);
    await venueName(dialog).fill('Old venue');
    await expect.poll(() => reads.length).toBe(1);
    await venueName(dialog).fill('Lookup');
    await expect(page.getByRole('option', { name: optionLabel })).toBeVisible();
    old.release();
    await page.getByRole('option', { name: optionLabel }).click();
    await expect(dialog.getByLabel('* Street Address', { exact: true })).toHaveValue('123 Campbell Ave');
    await expect(page.getByRole('option', { name: /Obsolete Hall/ })).toHaveCount(0);
  });
}
