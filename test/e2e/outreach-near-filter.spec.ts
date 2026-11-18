import { test, expect } from '@playwright/test';

const venues = [
  {
    _id: 'venue-lynchburg',
    name: 'Lynchburg Brewpub',
    city: 'Lynchburg',
    usState: 'VA',
    venueType: 'PubFestivalBrewery',
    email: 'lynchburg@example.com',
  },
  {
    _id: 'venue-roanoke',
    name: 'Roanoke Taproom',
    city: 'Roanoke',
    usState: 'VA',
    venueType: 'PubFestivalBrewery',
    email: 'roanoke@example.com',
  },
];

test('Find Eligible Venues Near radius filter sends geo params, caches place, and clears cleanly', async ({ page, context }) => {
  await context.addInitScript(() => {
    localStorage.setItem('auth', JSON.stringify({
      isAuthenticated: true, error: '',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImV4cCI6OTk5OTk5OTk5OX0.signature',
      user: { userType: 'Developer', email: 'admin@example.com' },
    }));
  });
  await page.routeWebSocket(/.*/, ws => ws.close());
  await page.route(/^https:\/\//, route => route.abort());

  const placeQueries: string[] = [];
  const candidateQueries: Array<{ lat: string | null; lng: string | null; radiusMiles: string | null }> = [];

  await page.route('http://localhost:7000/**', async route => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    let body: unknown = [];

    if (path === '/user/user-123') {
      body = { userType: 'Developer', email: 'admin@example.com' };
    } else if (path === '/venue/discover/place') {
      placeQueries.push(url.searchParams.get('q') ?? '');
      body = { lat: 37.4138, lng: -79.1422, displayName: 'Lynchburg, Virginia' };
    } else if (path === '/outreach/candidates') {
      const lat = url.searchParams.get('lat');
      const lng = url.searchParams.get('lng');
      const radiusMiles = url.searchParams.get('radiusMiles');
      candidateQueries.push({ lat, lng, radiusMiles });
      body = lat && lng && radiusMiles ? [venues[0]] : venues;
    }

    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });

  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('/admin/outreach', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('admin-outreach-page')).toBeVisible();
  await expect(page.getByTestId('outreach-osm-credit')).toContainText('OpenStreetMap contributors');

  const date = page.getByRole('group', { name: 'Weekend (eligibility)' });
  await date.getByRole('spinbutton', { name: 'Month' }).fill('08');
  await date.getByRole('spinbutton', { name: 'Day' }).fill('15');
  await date.getByRole('spinbutton', { name: 'Year' }).fill('2026');

  const nearInput = page.getByTestId('outreach-near-place').locator('input');
  const radiusInput = page.getByTestId('outreach-near-radius').locator('input');
  await expect(radiusInput).toHaveValue('25');

  await nearInput.fill('Lynchburg, VA');
  await page.getByTestId('outreach-load').click();

  await expect(page.getByTestId('outreach-candidates')).toContainText('1 of 1');
  await expect(page.getByTestId('outreach-near-resolved')).toHaveText('Filtering within 25 mi of Lynchburg, Virginia');
  expect(placeQueries).toEqual(['Lynchburg, VA']);
  expect(candidateQueries).toEqual([{ lat: '37.4138', lng: '-79.1422', radiusMiles: '25' }]);

  // Typing a new radius keeps the active caption until Find Eligible Venues runs again
  await radiusInput.fill('60');
  await expect(page.getByTestId('outreach-near-resolved')).toHaveText('Filtering within 25 mi of Lynchburg, Virginia');

  await page.getByTestId('outreach-load').click();
  await expect(page.getByTestId('outreach-near-resolved')).toHaveText('Filtering within 60 mi of Lynchburg, Virginia');
  expect(placeQueries).toHaveLength(1);
  expect(candidateQueries[1]).toEqual({ lat: '37.4138', lng: '-79.1422', radiusMiles: '60' });

  // Clearing Near keeps the active caption until the unfiltered load runs
  await page.getByTestId('outreach-near-clear').click();
  await expect(nearInput).toHaveValue('');
  await expect(page.getByTestId('outreach-near-resolved')).toHaveText('Filtering within 60 mi of Lynchburg, Virginia');

  await page.getByTestId('outreach-load').click();
  await expect(page.getByTestId('outreach-candidates')).toContainText('2 of 2');
  await expect(page.getByTestId('outreach-near-resolved')).toHaveCount(0);
  expect(candidateQueries[2]).toEqual({ lat: null, lng: null, radiusMiles: null });
});
