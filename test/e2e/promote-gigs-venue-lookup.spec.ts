import { test, expect, type Page } from '@playwright/test';

const listing = {
  listingId: 'listing-1',
  name: 'Durty Bull Brewing',
  street: '123 Campbell Ave',
  city: 'Roanoke',
  state: 'VA',
  zipCode: '24011',
  website: 'https://durtybull.example',
  lat: 37.27,
  lng: -79.94,
};
const optionLabel = 'Durty Bull Brewing — 123 Campbell Ave, Roanoke';

interface LookupScenario {
  suggestions?: unknown;
  suggestionStatus?: number;
  holdOldSearch?: Promise<void>;
  noLocation?: boolean;
}

async function setup(page: Page, scenario: LookupScenario = {}) {
  const reads: { url: URL; authorization: string | undefined }[] = [];
  const writes: Record<string, unknown>[] = [];
  const googleRequests: string[] = [];
  await page.context().addInitScript(() => {
    localStorage.setItem('auth', JSON.stringify({
      isAuthenticated: true, error: '',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImV4cCI6OTk5OTk5OTk5OX0.signature',
      user: { userType: 'Developer', email: 'admin@example.test' },
    }));
  });
  await page.routeWebSocket('**/*', (socket) => socket.close());
  await page.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (['maps.googleapis.com', 'places.googleapis.com'].includes(url.hostname)) googleRequests.push(url.href);
    if (url.hostname === 'localhost' && url.port !== '7000') { await route.continue(); return; }
    if (url.pathname === '/user/user-123') {
      await route.fulfill({ json: { userType: 'Developer', email: 'admin@example.test' } });
    } else if (url.pathname === '/venue/listings/search') {
      reads.push({ url, authorization: request.headers().authorization });
      if (url.searchParams.get('q') === 'Old cafe') {
        await scenario.holdOldSearch;
        await route.fulfill({ json: [{ ...listing, listingId: 'old', name: 'Obsolete Cafe' }] });
      } else {
        await route.fulfill({ status: scenario.suggestionStatus || 200, json: scenario.suggestions ?? [listing] });
      }
    } else if (url.pathname === '/venue') {
      if (request.method() === 'GET') await route.fulfill({ json: [] });
      else {
        const payload = request.postDataJSON() as Record<string, unknown>;
        writes.push(payload);
        const location = scenario.noLocation
          ? undefined
          : (payload.location ?? { type: 'Point', coordinates: [-80.05, 37.29] });
        await route.fulfill({ status: 201, json: { _id: 'new', ...payload, ...(location ? { location } : {}) } });
      }
    } else await route.abort();
  });
  await page.goto('/admin/venues');
  await page.getByTestId('admin-venues-add-button').click();
  return { reads, writes, googleRequests };
}

const nameInput = (page: Page) => page.getByTestId('edit-venue-name').locator('input');
const addressInput = (page: Page) => page.getByTestId('edit-venue-address').locator('input');

async function choose(page: Page, query = 'Durty Bull', label = optionLabel) {
  await nameInput(page).fill(query);
  await expect(page.getByRole('option', { name: label })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Google Maps' })).toHaveCount(0);
  await page.getByRole('option', { name: label }).click();
}

async function manualFields(page: Page) {
  await addressInput(page).fill('999 Manual St');
  await page.getByTestId('edit-venue-city').locator('input').fill('Salem');
  await page.getByTestId('edit-venue-state').click();
  await page.getByRole('option', { name: 'Virginia (VA)', exact: true }).click();
  await page.getByTestId('edit-venue-zip').locator('input').fill('24153');
}

test('selects backend listing with no Google content, fills fields and saves coordinates', async ({ page }) => {
  const { reads, writes, googleRequests } = await setup(page);
  await choose(page);
  await expect(nameInput(page)).toHaveValue('Durty Bull Brewing');
  await expect(addressInput(page)).toHaveValue('123 Campbell Ave');
  await expect(page.getByTestId('edit-venue-city').locator('input')).toHaveValue('Roanoke');
  await expect(page.getByTestId('edit-venue-zip').locator('input')).toHaveValue('24011');
  await expect(page.getByTestId('edit-venue-website').locator('input')).toHaveValue('https://durtybull.example');
  expect(reads).toHaveLength(1);
  expect(reads[0].url.searchParams.get('q')).toBe('Durty Bull');
  expect(reads[0].authorization?.startsWith('Bearer ')).toBe(true);
  await page.getByTestId('edit-venue-save').click();
  await expect(page.getByTestId('admin-venues-save-result')).toHaveText('Venue created');
  expect(writes[0]).toMatchObject({
    name: 'Durty Bull Brewing',
    address: '123 Campbell Ave',
    website: 'https://durtybull.example',
    location: { type: 'Point', coordinates: [-79.94, 37.27] },
  });
  expect(googleRequests).toEqual([]);
});

test('keeps an already typed website as typed when selecting a listing', async ({ page }) => {
  const { writes } = await setup(page);
  await page.getByTestId('edit-venue-website').locator('input').fill('https://typed.example');
  await choose(page);
  await expect(page.getByTestId('edit-venue-website').locator('input')).toHaveValue('https://typed.example');
  await page.getByTestId('edit-venue-save').click();
  await expect(page.getByTestId('admin-venues-save-result')).toHaveText('Venue created');
  expect(writes[0].website).toBe('https://typed.example');
});

for (const scenario of [
  { name: 'not loaded (503)', suggestionStatus: 503, suggestions: { message: 'Venue listings have not loaded yet' } },
  { name: 'failed search (502)', suggestionStatus: 502, suggestions: { message: 'Address lookup is unavailable' } },
  { name: 'empty listings', suggestions: [] },
]) {
  test(`typed entry saves and shows no-position notice when saved venue lacks location (${scenario.name})`, async ({ page }) => {
    const { writes } = await setup(page, { ...scenario, noLocation: true });
    await nameInput(page).fill('Manual Cafe');
    await expect(page.getByTestId('address-lookup-message')).toContainText('manually');
    await expect(nameInput(page)).toHaveValue('Manual Cafe');
    await manualFields(page);
    await page.getByTestId('edit-venue-save').click();
    await expect(page.getByTestId('admin-venues-save-result'))
      .toHaveText("Venue created. Saved. No map position was found for this address, so this venue won't appear in Near searches.");
    expect(writes[0]).toMatchObject({ name: 'Manual Cafe', address: '999 Manual St', city: 'Salem', zipCode: '24153' });
    expect(writes[0]).not.toHaveProperty('location');
  });
}

test('an incomplete listing cannot bypass required-field checks', async ({ page }) => {
  const { writes } = await setup(page, {
    suggestions: [{ ...listing, city: '', state: '', zipCode: '', website: '' }],
  });
  await choose(page, 'Durty Bull', 'Durty Bull Brewing — 123 Campbell Ave');
  await expect(addressInput(page)).toHaveValue('123 Campbell Ave');
  await page.getByTestId('edit-venue-save').click();
  await expect(page.getByTestId('edit-venue-error')).toBeVisible();
  expect(writes).toHaveLength(0);
  await manualFields(page);
  await page.getByTestId('edit-venue-save').click();
  await expect(page.getByTestId('admin-venues-save-result')).toHaveText('Venue created');
});

test('older search results cannot replace a newer search', async ({ page }) => {
  let release!: () => void;
  const holdOldSearch = new Promise<void>((resolve) => { release = resolve; });
  const { reads } = await setup(page, { holdOldSearch });
  await nameInput(page).fill('Old cafe');
  await expect.poll(() => reads.length).toBe(1);
  await nameInput(page).fill('Durty Bull');
  await expect(page.getByRole('option', { name: optionLabel })).toBeVisible();
  release();
  await expect(page.getByRole('option', { name: /Obsolete Cafe/ })).toBeHidden();
  await page.getByRole('option', { name: optionLabel }).click();
  await expect(addressInput(page)).toHaveValue('123 Campbell Ave');
});

test('manual address edit drops the selected listing pin', async ({ page }) => {
  const { writes } = await setup(page);
  await choose(page);
  await addressInput(page).fill('999 My address');
  await page.getByTestId('edit-venue-save').click();
  await expect(page.getByTestId('admin-venues-save-result')).toHaveText('Venue created');
  expect(writes[0]).toMatchObject({ address: '999 My address', city: 'Roanoke', zipCode: '24011' });
  expect(writes[0]).not.toHaveProperty('location');
});
