import { test, expect } from '@playwright/test';

test.describe('Find-Eligible-Venues Candidate Reason Chips', () => {
  test.beforeEach(async ({ context, page }) => {
    // Seed localStorage to simulate a logged-in Developer/Admin user
    await context.addInitScript(() => {
      try {
        const authData = {
          isAuthenticated: true,
          error: '',
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImV4cCI6OTk5OTk5OTk5OX0.signature',
          user: {
            userType: 'Developer',
            email: 'joshua@web-jam.com',
          },
        };
        localStorage.setItem('auth', JSON.stringify(authData));
      } catch { /* ignore */ }
    });

    // Intercept user profile retrieval API call
    await page.route(/\/user\/user-123/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userType: 'Developer',
          email: 'joshua@web-jam.com',
        }),
      });
    });

    // Intercept outreach config API call
    await page.route('http://localhost:7000/outreach/config*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ autoApprove: false }),
      });
    });

    // Intercept outreach pending replies API call
    await page.route('http://localhost:7000/outreach/replies/pending*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    // Intercept outreach templates API call
    await page.route('http://localhost:7000/outreach/templates*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    // Intercept outreach list API call
    await page.route('http://localhost:7000/outreach', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    // Intercept venue listing
    await page.route('http://localhost:7000/venue*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    // Intercept gig listing
    await page.route('http://localhost:7000/gig*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    // Intercept /outreach/candidates with all representative reason chip configurations
    await page.route('http://localhost:7000/outreach/candidates*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            _id: 'c-golden-pony',
            name: 'The Golden Pony',
            city: 'Harrisonburg',
            usState: 'VA',
            venueType: 'Originals',
            reason: {
              lastGigDate: '2026-02-15T19:00:00.000Z',
              gigIntervalMonths: 2,
              nearestGigMonthsAway: 6,
              spacingNote: 'clear — nearest gig ~6 mo away',
              resumeBookingExpired: false,
            },
          },
          {
            _id: 'c-martins',
            name: "Martin's Downtown",
            city: 'Roanoke',
            usState: 'VA',
            venueType: 'PubFestivalBrewery',
            reason: {
              lastGigDate: null,
              gigIntervalMonths: 3,
              nearestGigMonthsAway: null,
              spacingNote: 'no gigs yet',
              resumeBookingExpired: false,
            },
          },
          {
            _id: 'c-spot',
            name: 'The Spot on Kirk',
            city: 'Roanoke',
            usState: 'VA',
            venueType: 'MidRangeCafeBar',
            reason: {
              lastGigDate: null,
              gigIntervalMonths: 0,
              nearestGigMonthsAway: null,
              spacingNote: 'spacing off (gigInterval=0)',
              resumeBookingExpired: true,
            },
          },
          {
            _id: 'c-parkway',
            name: 'Parkway Brewing Company',
            city: 'Salem',
            usState: 'VA',
            venueType: 'PubFestivalBrewery',
            reason: {
              lastGigDate: null,
              gigIntervalMonths: 0,
              nearestGigMonthsAway: null,
              spacingNote: 'spacing off (gigInterval=0)',
              resumeBookingExpired: false,
            },
          },
        ]),
      });
    });
  });

  test('renders all representative reason chips across candidate venues', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/admin/outreach', { waitUntil: 'domcontentloaded' });

    // Ensure outreach page is loaded
    const pageTitle = page.locator('[data-testid="admin-outreach-page"]');
    await expect(pageTitle).toBeVisible();

    // Fill weekend eligibility date via spinbuttons
    const dateGroup = page.getByRole('group', { name: 'Weekend (eligibility)' });
    await expect(dateGroup).toBeVisible();
    await dateGroup.getByRole('spinbutton', { name: 'Month' }).fill('09');
    await dateGroup.getByRole('spinbutton', { name: 'Day' }).fill('15');
    await dateGroup.getByRole('spinbutton', { name: 'Year' }).fill('2026');

    // Click "Find Eligible Venues"
    const findButton = page.locator('[data-testid="outreach-load"]');
    await expect(findButton).toBeVisible();
    await findButton.click();

    // Verify candidates container appears
    const candidatesContainer = page.locator('[data-testid="outreach-candidates"]');
    await expect(candidatesContainer).toBeVisible();

    // 1. Candidate 1: The Golden Pony — spacing clear, non-null last gig, nearest gig, interval
    const ponyReason = page.locator('[data-testid="outreach-reason-c-golden-pony"]');
    await expect(ponyReason).toBeVisible();
    await expect(ponyReason).toContainText('clear — nearest gig ~6 mo away');
    await expect(ponyReason).toContainText('Gig interval: 2 mo');
    await expect(ponyReason).toContainText('Nearest Gig: 6 mo');
    await expect(ponyReason).toContainText('Last Gig:');

    // 2. Candidate 2: Martin\'s Downtown — spacing "no gigs yet", interval 3 mo
    const martinsReason = page.locator('[data-testid="outreach-reason-c-martins"]');
    await expect(martinsReason).toBeVisible();
    await expect(martinsReason).toContainText('no gigs yet');
    await expect(martinsReason).toContainText('Gig interval: 3 mo');

    // 3. Candidate 3: The Spot on Kirk — "Cooldown Expired", spacing off (gigInterval=0)
    const spotReason = page.locator('[data-testid="outreach-reason-c-spot"]');
    await expect(spotReason).toBeVisible();
    await expect(spotReason).toContainText('Cooldown Expired');
    await expect(spotReason).toContainText('spacing off (gigInterval=0)');

    // 4. Candidate 4: Parkway Brewing Company — spacing off (gigInterval=0), interval 0 mo
    const parkwayReason = page.locator('[data-testid="outreach-reason-c-parkway"]');
    await expect(parkwayReason).toBeVisible();
    await expect(parkwayReason).toContainText('spacing off (gigInterval=0)');
    await expect(parkwayReason).toContainText('Gig interval: 0 mo');
  });
});
