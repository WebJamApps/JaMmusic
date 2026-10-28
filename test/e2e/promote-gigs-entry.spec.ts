import { test, expect, type Page } from '@playwright/test';

import { fixture, openGigDialog } from './helpers/gig-fixture';

async function openDialog(page: Page, mode: 'create' | 'edit') {
  const dialog = await openGigDialog(page, mode);
  await dialog.getByLabel('Create New Venue', { exact: true }).check();
  await dialog.getByLabel('* Venue Name', { exact: true }).fill(' The Hall ');
  await dialog.getByLabel('* Street Address', { exact: true }).fill('1 Electric Road');
  await dialog.getByLabel('* City', { exact: true }).fill(' Salem ');
  await dialog.getByLabel('* Zip Code', { exact: true }).fill('24153');
  await expect(dialog.getByText(/1 Electric Rd.*\[archived\]/)).toBeVisible();
  const submit = dialog.getByRole('button', { name: mode === 'create' ? 'Create' : 'Update', exact: true });
  await expect(submit).toBeEnabled();
  return { dialog, submit };
}

for (const mode of ['create', 'edit'] as const) {
  test(`${mode}: typed validation, separate venue/gig failures and unchanged retry`, async ({ page }) => {
    const { state, venueWrites, gigWrites } = await fixture(page);
    const { dialog, submit } = await openDialog(page, mode);
    await dialog.getByLabel('* Street Address', { exact: true }).fill('   ');
    await expect(submit).toBeDisabled();
    await dialog.getByLabel('* Street Address', { exact: true }).fill('1 Electric Road');
    await dialog.getByLabel('* Zip Code', { exact: true }).fill('bad');
    await expect(submit).toBeDisabled();
    await dialog.getByLabel('* Zip Code', { exact: true }).fill('24153-1234');
    await dialog.getByLabel('Website', { exact: true }).fill('bad-url');
    await expect(submit).toBeDisabled();
    await dialog.getByLabel('Website', { exact: true }).fill('hall.example.com');
    state.venueFailure = true;
    await submit.click();
    await expect(dialog.getByRole('alert')).toHaveText(/Several address-less/);
    expect(gigWrites).toHaveLength(0);
    await expect(dialog.getByLabel('Website', { exact: true })).toHaveValue('hall.example.com');
    state.venueFailure = false;
    state.socketResult = 'error';
    await submit.click();
    await expect(dialog.getByRole('alert')).toHaveText('Gig save refused by socket');
    await expect(dialog.getByText('Existing archived venue restored and updated', { exact: true })).toBeVisible();
    await expect(dialog.getByLabel('* Venue Name', { exact: true })).toHaveValue(' The Hall ');
    expect(venueWrites[1]).toEqual({
      name: 'The Hall', address: '1 Electric Road', city: 'Salem', usState: 'VA',
      zipCode: '24153-1234', website: 'https://hall.example.com', status: 'active',
    });
    expect(gigWrites[0].data?.gig?.venueId).toBe('archivedHall');
    state.socketResult = 'success';
    await submit.click();
    await expect(dialog).not.toBeVisible();
    expect(venueWrites).toHaveLength(2);
    expect(gigWrites).toHaveLength(2);
    await expect(page.locator('.gigsDiv > [role="status"]')).toContainText(mode === 'create' ? 'Gig created.' : 'Gig updated.');
    const reopened = await openGigDialog(page, mode);
    await expect(page.locator('.gigsDiv > [role="status"]')).toHaveCount(0);
    await reopened.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(reopened).not.toBeVisible();
  });

  test(`${mode}: optional website and unconfirmed gig outcome remain accurate after closing`, async ({ page }) => {
    const { state, venueWrites } = await fixture(page);
    const { dialog, submit } = await openDialog(page, mode);
    state.socketResult = 'timeout';
    state.venueStatus = 201;
    await submit.click();
    await expect(dialog).not.toBeVisible();
    expect(venueWrites[0].website).toBe('');
    await expect(page.locator('.gigsDiv > [role="status"]')).toHaveText("Venue created. Couldn't confirm gig save — list refreshed.");
  });

  test(`${mode}: cancel leaves both venue and gig unsaved`, async ({ page }) => {
    const { venueWrites, gigWrites } = await fixture(page);
    const { dialog } = await openDialog(page, mode);
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(dialog).not.toBeVisible();
    expect(venueWrites).toHaveLength(0);
    expect(gigWrites).toHaveLength(0);
  });

  test(`${mode}: picking an existing venue saves its ID without a venue write`, async ({ page }) => {
    const { venueWrites, gigWrites } = await fixture(page);
    const dialog = await openGigDialog(page, mode);
    const search = dialog.getByRole('combobox', { name: '* Search Venues', exact: true });
    await search.fill('');
    await search.click();
    await expect(page.getByRole('option', { name: 'Existing Hall', exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: 'The Hall', exact: true })).toHaveCount(0);
    await search.fill('Existing');
    await page.getByRole('option', { name: 'Existing Hall', exact: true }).click();
    await dialog.getByRole('button', { name: mode === 'create' ? 'Create' : 'Update', exact: true }).click();
    await expect(dialog).not.toBeVisible();
    expect(venueWrites).toHaveLength(0);
    expect(gigWrites[0].data?.gig?.venueId).toBe('existing');
  });
}
