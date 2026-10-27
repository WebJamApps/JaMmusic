import { test, expect, type Page } from '@playwright/test';

const suggestion = { placeId: 'place-1', text: '123 Campbell Ave, Roanoke' };
const details = { street: '123 Campbell Ave', city: 'Roanoke', state: 'VA', country: 'US', zipCode: '24011', lat: 37.27, lng: -79.94 };
interface LookupScenario {
  suggestions?: unknown; suggestionStatus?: number; detailStatus?: number; details?: unknown;
  holdDetails?: Promise<void>; holdOldSearch?: Promise<void>;
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
    } else if (url.pathname.startsWith('/venue/places/')) {
      reads.push({ url, authorization: request.headers().authorization });
      if (url.pathname.endsWith('/suggest')) {
        if (url.searchParams.get('input') === 'Old street') {
          await scenario.holdOldSearch;
          await route.fulfill({ json: [{ placeId: 'old', text: 'Obsolete suggestion' }] });
        } else {
          await route.fulfill({ status: scenario.suggestionStatus || 200, json: scenario.suggestions ?? [suggestion] });
        }
      } else {
        await scenario.holdDetails;
        await route.fulfill({ status: scenario.detailStatus || 200, json: scenario.details ?? details });
      }
    } else if (url.pathname === '/venue') {
      if (request.method() === 'GET') await route.fulfill({ json: [] });
      else {
        writes.push(request.postDataJSON());
        await route.fulfill({ status: 201, json: { _id: 'new', ...request.postDataJSON() } });
      }
    } else await route.abort();
  });
  await page.goto('/admin/venues');
  await page.getByTestId('admin-venues-add-button').click();
  await page.getByTestId('edit-venue-name').locator('input').fill('New Cafe');
  return { reads, writes, googleRequests };
}
const address = (page: Page) => page.getByTestId('edit-venue-address').locator('input');
async function choose(page: Page) {
  await address(page).fill('123 Campbell');
  await expect(page.getByRole('option', { name: suggestion.text })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Google Maps' })).toBeVisible();
  await page.getByRole('option', { name: suggestion.text }).click();
}
async function manualFields(page: Page) {
  await page.getByTestId('edit-venue-city').locator('input').fill('Salem');
  await page.getByTestId('edit-venue-state').click();
  await page.getByRole('option', { name: 'Virginia (VA)', exact: true }).click();
  await page.getByTestId('edit-venue-zip').locator('input').fill('24153');
}

test('selects backend suggestions with attribution, exact coordinates and one session token', async ({ page }) => {
  const { reads, writes, googleRequests } = await setup(page);
  await choose(page);
  await expect(address(page)).toHaveValue('123 Campbell Ave');
  await expect(page.getByTestId('edit-venue-city').locator('input')).toHaveValue('Roanoke');
  await expect(page.getByTestId('edit-venue-zip').locator('input')).toHaveValue('24011');
  const firstToken = reads[0].url.searchParams.get('sessionToken');
  expect(firstToken).toMatch(/^[\da-f-]{36}$/i);
  expect(reads[1].url.searchParams.get('sessionToken')).toBe(firstToken);
  expect(reads.every((read) => read.authorization?.startsWith('Bearer '))).toBe(true);
  await page.getByTestId('edit-venue-save').click();
  await expect(page.getByTestId('admin-venues-save-result')).toHaveText('Venue created');
  expect(writes[0]).toMatchObject({ address: '123 Campbell Ave', location: { type: 'Point', coordinates: [-79.94, 37.27] } });
  expect(googleRequests).toEqual([]);
});

for (const scenario of [
  { name: 'not configured', suggestionStatus: 503, suggestions: { message: 'Address lookup is not configured' } },
  { name: 'failed suggestion', suggestionStatus: 502, suggestions: { message: 'Upstream failed' } },
  { name: 'empty suggestions', suggestions: [] },
]) {
  test(`typed entry saves when lookup returns ${scenario.name}`, async ({ page }) => {
    const { writes } = await setup(page, scenario);
    await address(page).fill('999 Manual St');
    await expect(page.getByTestId('address-lookup-message')).toContainText('manually');
    await expect(address(page)).toHaveValue('999 Manual St');
    await manualFields(page);
    await page.getByTestId('edit-venue-save').click();
    await expect(page.getByTestId('admin-venues-save-result')).toHaveText('Venue created');
    expect(writes[0]).toMatchObject({ address: '999 Manual St', city: 'Salem', zipCode: '24153' });
    expect(writes[0]).not.toHaveProperty('location');
  });
}

test('detail failure keeps typed values and allows a manual save', async ({ page }) => {
  const { writes } = await setup(page, { detailStatus: 502 });
  await choose(page);
  await expect(page.getByTestId('address-lookup-message')).toContainText('manually');
  await expect(address(page)).toHaveValue('123 Campbell');
  await manualFields(page);
  await page.getByTestId('edit-venue-save').click();
  await expect(page.getByTestId('admin-venues-save-result')).toHaveText('Venue created');
  expect(writes[0].address).toBe('123 Campbell');
});

test('an incomplete place cannot bypass required-field checks', async ({ page }) => {
  const { writes } = await setup(page, { details: { street: '1 Main St', country: 'US' } });
  await choose(page);
  await expect(address(page)).toHaveValue('1 Main St');
  await page.getByTestId('edit-venue-save').click();
  await expect(page.getByTestId('edit-venue-error')).toBeVisible();
  expect(writes).toHaveLength(0);
  await manualFields(page);
  await page.getByTestId('edit-venue-save').click();
  await expect(page.getByTestId('admin-venues-save-result')).toHaveText('Venue created');
});

test('older search results cannot replace a newer search and selection starts a new session', async ({ page }) => {
  let release!: () => void;
  const holdOldSearch = new Promise<void>((resolve) => { release = resolve; });
  const { reads } = await setup(page, { holdOldSearch });
  await address(page).fill('Old street');
  await expect.poll(() => reads.length).toBe(1);
  await address(page).fill('123 Campbell');
  await expect(page.getByRole('option', { name: suggestion.text })).toBeVisible();
  release();
  await expect(page.getByRole('option', { name: 'Obsolete suggestion' })).toBeHidden();
  await page.getByRole('option', { name: suggestion.text }).click();
  await expect(address(page)).toHaveValue('123 Campbell Ave');
  await address(page).fill('New search');
  await expect.poll(() => reads.length).toBe(4);
  expect(reads[3].url.searchParams.get('sessionToken')).not.toBe(reads[0].url.searchParams.get('sessionToken'));
});

test('a later manual edit wins over pending details', async ({ page }) => {
  let release!: () => void;
  const holdDetails = new Promise<void>((resolve) => { release = resolve; });
  const { reads, writes } = await setup(page, { holdDetails });
  await choose(page);
  await expect.poll(() => reads.length).toBe(2);
  await address(page).fill('999 My address');
  await manualFields(page);
  release();
  await page.getByTestId('edit-venue-save').click();
  await expect(page.getByTestId('admin-venues-save-result')).toHaveText('Venue created');
  expect(writes[0]).toMatchObject({ address: '999 My address', city: 'Salem', zipCode: '24153' });
  expect(writes[0]).not.toHaveProperty('location');
});
