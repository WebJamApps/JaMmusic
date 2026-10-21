import { test, expect, type Page } from '@playwright/test';
import type { Ivenue } from '../../src/containers/AdminVenues/admin-venues.utils';

interface SaveResponse { status: number; venue?: Ivenue; message?: string }
const baseVenue: Ivenue = {
  _id: 'selected', name: 'Test Cafe', address: '1 Electric Road', city: 'Salem', usState: 'VA',
  zipCode: '24153', country: 'US', status: 'active',
};

async function setup(page: Page, inventory: Ivenue[], response: SaveResponse) {
  const writes: { method: string; path: string; payload: Record<string, unknown> }[] = [];
  const reads: string[] = [];
  await page.context().addInitScript(() => {
    localStorage.setItem('auth', JSON.stringify({
      isAuthenticated: true, error: '',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImV4cCI6OTk5OTk5OTk5OX0.signature',
      user: { userType: 'Developer', email: 'admin@example.test' },
    }));
  });
  await page.routeWebSocket('**/*', (socket) => socket.close());
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.port === '7878') { await route.continue(); return; }
    if (url.pathname === '/user/user-123') {
      await route.fulfill({ json: { userType: 'Developer', email: 'admin@example.test' } });
      return;
    }
    if (url.pathname === '/venue' || url.pathname.startsWith('/venue/')) {
      const request = route.request();
      if (request.method() === 'GET') {
        reads.push(url.search);
        const rows = url.searchParams.has('eligibleFor') ? [] : inventory.filter((v) =>
          url.searchParams.get('status') === 'archived' ? v.status === 'archived' : v.status !== 'archived');
        await route.fulfill({ json: rows });
      } else {
        writes.push({ method: request.method(), path: url.pathname, payload: request.postDataJSON() });
        await route.fulfill({ status: response.status, json: response.message ? { message: response.message } : response.venue });
      }
      return;
    }
    await route.abort();
  });
  await page.goto('/admin/venues');
  await expect(page.getByTestId('admin-venues-page')).toBeVisible();
  return { writes, reads };
}

async function createForm(page: Page, address = '1 Electric Rd', city = 'Salem') {
  await page.getByTestId('admin-venues-add-button').click();
  await page.getByTestId('edit-venue-name').locator('input').fill(' test cafe ');
  await page.getByTestId('edit-venue-address').locator('input').fill(address);
  await page.getByTestId('edit-venue-city').locator('input').fill(city);
  await page.getByTestId('edit-venue-state').click();
  await page.getByRole('option', { name: 'Virginia (VA)', exact: true }).click();
  await page.getByTestId('edit-venue-zip').locator('input').fill('24153-1234');
  await page.getByTestId('edit-venue-website').locator('input').fill('example.test');
}

const scenarios = [
  { title: 'normalized street match updates', venues: [baseVenue], status: 200, id: 'selected', result: 'Existing venue updated' },
  { title: 'different city creates', venues: [{ ...baseVenue, city: 'Roanoke' }], status: 201, id: 'new', result: 'Venue created' },
  { title: 'different street creates another location', venues: [{ ...baseVenue, address: '9 Main St' }],
    status: 201, id: 'new', result: 'Venue created' },
  { title: 'one address-less legacy match updates', venues: [{ ...baseVenue, address: '' }],
    status: 200, id: 'selected', result: 'Existing venue updated' },
  { title: 'archived match is restored', venues: [{ ...baseVenue, status: 'archived' }],
    status: 200, id: 'selected', result: 'Existing archived venue restored and updated' },
  { title: 'mixed cities keep same-city fallback conditional',
    venues: [{ ...baseVenue, address: '' }, { ...baseVenue, _id: 'other', city: 'Roanoke' }],
    status: 200, id: 'selected', result: 'Existing venue updated' },
] as const;

for (const scenario of scenarios) {
  test(scenario.title, async ({ page }) => {
    const { writes, reads } = await setup(page, [...scenario.venues], {
      status: scenario.status, venue: { ...baseVenue, _id: scenario.id },
    });
    await page.getByTestId('venues-target-date').locator('input').fill('2026-12-12');
    await expect(page.getByTestId('admin-venues-loading')).toBeHidden();
    await createForm(page);
    let warning = '';
    page.once('dialog', async (dialog) => { warning = dialog.message(); await dialog.accept(); });
    await page.getByTestId('edit-venue-save').click();
    await expect(page.getByTestId('edit-venue-dialog-title')).toBeHidden();
    await expect(page.getByTestId('admin-venues-save-result')).toHaveText(scenario.result);
    expect(warning).toContain('Backend save rules:');
    expect(warning).toContain('normalized street address');
    expect(warning).toContain('no street-address match');
    for (const venue of scenario.venues) expect(warning).toContain(venue.address || 'no address on file');
    if (scenario.title.startsWith('mixed')) expect(warning).not.toContain('will result in creating a separate venue');
    expect(reads).toContain('');
    expect(reads).toContain('?status=archived');
    expect(writes).toEqual([{ method: 'POST', path: '/venue', payload: expect.objectContaining({
      name: 'test cafe', address: '1 Electric Rd', city: 'Salem', usState: 'VA', zipCode: '24153-1234',
      website: 'https://example.test', status: 'active',
    }) }]);
  });
}

test('warning cancellation retains input and sends no write', async ({ page }) => {
  const { writes } = await setup(page, [baseVenue], { status: 201, venue: baseVenue });
  await createForm(page);
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByTestId('edit-venue-save').click();
  await expect(page.getByTestId('edit-venue-name').locator('input')).toHaveValue(' test cafe ');
  expect(writes).toHaveLength(0);
  await page.getByTestId('edit-venue-cancel').click();
  await expect(page.getByTestId('edit-venue-dialog-title')).toBeHidden();
  expect(writes).toHaveLength(0);
});

test('ambiguous legacy match shows backend error and retains input for retry', async ({ page }) => {
  const response: SaveResponse = { status: 400, message: 'Several address-less venues match; choose a venue to edit' };
  const { writes } = await setup(page, [{ ...baseVenue, address: '' }, { ...baseVenue, _id: 'second', address: '' }], response);
  await createForm(page);
  const warnings: string[] = [];
  page.on('dialog', async (dialog) => { warnings.push(dialog.message()); await dialog.accept(); });
  await page.getByTestId('edit-venue-save').click();
  await expect(page.getByTestId('edit-venue-error')).toHaveText(response.message!);
  expect(warnings[0]).toContain('Several same-name-and-city records have no address on file');
  expect(warnings[0]).toContain('backend will refuse to guess');
  await expect(page.getByTestId('edit-venue-address').locator('input')).toHaveValue('1 Electric Rd');
  await expect(page.getByTestId('edit-venue-website').locator('input')).toHaveValue('example.test');
  await expect(page.getByTestId('admin-venues-save-result')).toBeHidden();
  response.status = 201;
  delete response.message;
  response.venue = { ...baseVenue, _id: 'new' };
  await page.getByTestId('edit-venue-save').click();
  await expect(page.getByTestId('admin-venues-save-result')).toHaveText('Venue created');
  await page.getByTestId('admin-venues-add-button').click();
  await expect(page.getByTestId('admin-venues-save-result')).toBeHidden();
  await page.getByTestId('edit-venue-cancel').click();
  await expect(page.getByTestId('admin-venues-save-result')).toBeHidden();
  expect(writes).toHaveLength(2);
  expect(writes[1]).toEqual(writes[0]);
});

test('edit warns accurately and PATCHes only the selected ID', async ({ page }) => {
  const other = { ...baseVenue, _id: 'other', address: '9 Main St', status: 'archived' };
  const { writes } = await setup(page, [baseVenue, other], { status: 200, venue: baseVenue });
  await page.getByTestId('venue-edit-selected').click();
  await page.getByTestId('edit-venue-address').locator('input').fill('');
  await page.getByTestId('edit-venue-save').click();
  await expect(page.getByTestId('edit-venue-error')).toContainText("Address can't be removed");
  await page.getByTestId('edit-venue-address').locator('input').fill('2 Electric Road');
  await page.getByTestId('edit-venue-zip').locator('input').fill('');
  await page.getByTestId('edit-venue-save').click();
  await expect(page.getByTestId('edit-venue-error')).toContainText("Zip code can't be removed");
  expect(writes).toHaveLength(0);
  await page.getByTestId('edit-venue-zip').locator('input').fill('24153');
  let warning = '';
  page.once('dialog', async (dialog) => { warning = dialog.message(); await dialog.accept(); });
  await page.getByTestId('edit-venue-save').click();
  await expect(page.getByTestId('admin-venues-save-result')).toHaveText('Existing venue updated');
  expect(warning).toContain('9 Main St');
  expect(warning).toContain('Saving will edit the selected record');
  expect(warning).toContain('It will not create another record or restore another match');
  expect(writes).toEqual([{ method: 'PATCH', path: '/venue/selected', payload: expect.objectContaining({ address: '2 Electric Road' }) }]);
});

test('shared checks reject whitespace, bad ZIP and website; country keeps region rules', async ({ page }) => {
  const { writes } = await setup(page, [], { status: 201, venue: baseVenue });
  await createForm(page);
  const city = page.getByTestId('edit-venue-city').locator('input');
  await city.fill('   ');
  await page.getByTestId('edit-venue-save').click();
  await expect(page.getByTestId('edit-venue-error')).toHaveText('City is required');
  await city.fill('Toronto');
  const zip = page.getByTestId('edit-venue-zip').locator('input');
  await zip.fill('abc');
  await page.getByTestId('edit-venue-save').click();
  await expect(page.getByTestId('edit-venue-error')).toContainText('valid 5-digit');
  await zip.fill('12345');
  const website = page.getByTestId('edit-venue-website').locator('input');
  await website.fill('invalid');
  await page.getByTestId('edit-venue-save').click();
  await expect(page.getByTestId('edit-venue-error')).toHaveText('A valid website URL is required');
  expect(writes).toHaveLength(0);
  await website.fill('');
  await page.getByTestId('edit-venue-country').click();
  await page.getByRole('option', { name: 'Canada (CA)', exact: true }).click();
  await expect(page.getByTestId('edit-venue-state')).toBeHidden();
  await page.getByTestId('edit-venue-region').locator('input').fill('Ontario');
  await page.getByTestId('edit-venue-save').click();
  await expect(page.getByTestId('admin-venues-save-result')).toHaveText('Venue created');
  expect(writes[0].payload).toEqual(expect.objectContaining({ country: 'CA', region: 'Ontario', usState: '', website: '' }));
});
