import { test, expect } from '@playwright/test';

test.describe('Admin Venues page responsiveness and table scrollability', () => {
  test.beforeEach(async ({ context, page }) => {
    page.on('request', request => {
      console.log('>> REQUEST:', request.method(), request.url());
    });
    page.on('response', response => {
      console.log('<< RESPONSE:', response.status(), response.url());
    });
    page.on('console', msg => {
      console.log('BROWSER CONSOLE:', msg.text());
    });
    page.on('pageerror', err => {
      console.log('BROWSER PAGE ERROR:', err.message, err.stack);
    });

    // Seed localStorage to simulate a logged-in Developer/Admin user
    await context.addInitScript(() => {
      try {
        const authData = {
          isAuthenticated: true,
          error: '',
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImV4cCI6OTk5OTk5OTk5OX0.signature',
          user: {
            userType: 'Developer',
            email: 'joshua@web-jam.com'
          }
        };
        localStorage.setItem('auth', JSON.stringify(authData));
      } catch { /* ignore */ }
    });

    // Abort external Google Maps API requests to prevent flaky autocomplete re-renders
    await page.route(/maps\.googleapis\.com/, async (route) => {
      await route.abort();
    });

    // Intercept user profile retrieval API call
    await page.route(/\/user\/user-123/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userType: 'Developer',
          email: 'joshua@web-jam.com'
        }),
      });
    });

    // Intercept API calls to /venue (ignoring the /admin/venues frontend page route)
    await page.route('http://localhost:7000/venue*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            _id: 'v1',
            name: 'Normal Active Venue',
            city: 'Roanoke',
            usState: 'VA',
            venueType: 'Restaurant',
            status: 'active',
            outreachEligible: true,
            contactVerified: true,
            website: 'https://normalactivevenue.com',
            contactName: 'Jane Doe',
            email: 'jane@example.com',
          },
          {
            _id: 'v2',
            name: 'Archived Venue Name',
            city: 'Salem',
            usState: 'VA',
            venueType: 'Bar',
            status: 'archived',
            outreachEligible: false,
            contactVerified: true,
          }
        ]),
      });
    });
  });

  test('desktop viewport (1200px) shows all text labels and uses sticky table columns', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop viewport test is not applicable to mobile-emulated browsers');
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/admin/venues', { waitUntil: 'domcontentloaded' });

    // Page title should be fully visible and centered
    const pageTitle = page.locator('[data-testid="header-page-title"]');
    await expect(pageTitle).toBeVisible();
    const titleFontSize = await pageTitle.evaluate((el) => window.getComputedStyle(el).fontSize);
    expect(titleFontSize).toBe('20px');

    // "Web Jam LLC" branding text should be visible
    const brandText = page.locator('.header-text-card');
    await expect(brandText).toBeVisible();

    // "Show archived" label text should be visible next to the switch
    const showArchivedText = page.locator('p:has-text("Show archived")').first();
    const labelDisplay = await showArchivedText.evaluate((el) => window.getComputedStyle(el).display);
    expect(labelDisplay).not.toBe('none');

    // Actions and Name columns in the table must be sticky
    const actionsHeader = page.locator('th:has-text("Actions")').first();
    const nameHeader = page.locator('th:has-text("Name")').first();
    await expect(actionsHeader).toBeVisible();
    await expect(nameHeader).toBeVisible();

    const actionsPosition = await actionsHeader.evaluate((el) => window.getComputedStyle(el).position);
    const namePosition = await nameHeader.evaluate((el) => window.getComputedStyle(el).position);
    expect(actionsPosition).toBe('sticky');
    expect(namePosition).toBe('sticky');
  });

  test('tablet viewport (732px) hides labels and branding to prevent overlapping', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Tablet viewport test is not applicable to mobile-emulated browsers');
    await page.setViewportSize({ width: 732, height: 800 });
    await page.goto('/admin/venues', { waitUntil: 'domcontentloaded' });

    // Page title is visible and shrunk to 16px font-size
    const pageTitle = page.locator('[data-testid="header-page-title"]');
    await expect(pageTitle).toBeVisible();
    const titleFontSize = await pageTitle.evaluate((el) => window.getComputedStyle(el).fontSize);
    expect(titleFontSize).toBe('16px');

    // "Web Jam LLC" branding text is hidden below 768px to clear space
    const brandText = page.locator('.header-text-card');
    const brandDisplay = await brandText.evaluate((el) => window.getComputedStyle(el).display);
    expect(brandDisplay).toBe('none');

    // "Show archived" text label is hidden below 900px
    const showArchivedText = page.locator('p:has-text("Show archived")').first();
    const labelDisplay = await showArchivedText.evaluate((el) => window.getComputedStyle(el).display);
    expect(labelDisplay).toBe('none');

    // Check that there is absolutely no overlapping between left logo, centered title, and right portal controls
    const logoBox = await page.locator('#ohaflogo').boundingBox();
    const titleBox = await page.locator('[data-testid="header-page-title"]').boundingBox();
    const portalBox = await page.locator('#header-controls-portal').boundingBox();

    expect(logoBox).not.toBeNull();
    expect(titleBox).not.toBeNull();
    expect(portalBox).not.toBeNull();

    if (logoBox && titleBox && portalBox) {
      // Logo ends before title starts
      expect(logoBox.x + logoBox.width).toBeLessThan(titleBox.x);
      // Title ends before portal starts
      expect(titleBox.x + titleBox.width).toBeLessThan(portalBox.x);
    }
  });

  test('905px viewport has no overlap, hides branding text, and shrinks page title font', async ({ page, isMobile }) => {
    test.skip(isMobile, '905px viewport test is not applicable to mobile-emulated browsers');
    await page.setViewportSize({ width: 905, height: 800 });
    await page.goto('/admin/venues', { waitUntil: 'domcontentloaded' });

    // Page title is visible and shrunk to 16px font-size (since 905px <= 1024px)
    const pageTitle = page.locator('[data-testid="header-page-title"]');
    await expect(pageTitle).toBeVisible();
    const titleFontSize = await pageTitle.evaluate((el) => window.getComputedStyle(el).fontSize);
    expect(titleFontSize).toBe('16px');

    // "Web Jam LLC" branding text is hidden (since 905px <= 1024px)
    const brandText = page.locator('.header-text-card');
    const brandDisplay = await brandText.evaluate((el) => window.getComputedStyle(el).display);
    expect(brandDisplay).toBe('none');

    // "Show archived" text label is hidden below 1200px
    const showArchivedText = page.locator('p:has-text("Show archived")').first();
    const labelDisplay = await showArchivedText.evaluate((el) => window.getComputedStyle(el).display);
    expect(labelDisplay).toBe('none');

    // Buttons are icon-only (text labels hidden) below 1200px
    const exportButtonText = page.locator('[data-testid="admin-venues-export-button"] span').first();
    const createButtonText = page.locator('[data-testid="admin-venues-add-button"] span').first();
    await expect(exportButtonText).toBeHidden();
    await expect(createButtonText).toBeHidden();

    // Check that there is absolutely no overlapping between left logo, centered title, and right portal controls
    const logoBox = await page.locator('#ohaflogo').boundingBox();
    const titleBox = await page.locator('[data-testid="header-page-title"]').boundingBox();
    const portalBox = await page.locator('#header-controls-portal').boundingBox();

    expect(logoBox).not.toBeNull();
    expect(titleBox).not.toBeNull();
    expect(portalBox).not.toBeNull();

    if (logoBox && titleBox && portalBox) {
      // Logo ends before title starts
      expect(logoBox.x + logoBox.width).toBeLessThan(titleBox.x);
      // Title ends before portal starts
      expect(titleBox.x + titleBox.width).toBeLessThan(portalBox.x);
    }
  });

  test('mobile viewport (320px) hides page title and disables sticky columns for scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/admin/venues', { waitUntil: 'domcontentloaded' });

    // Centered page title should be completely hidden on mobile viewports below 500px to avoid clutter
    const pageTitle = page.locator('[data-testid="header-page-title"]');
    await expect(pageTitle).toBeHidden();

    // Sticky positioning should be disabled (position: static) for mobile widths
    const actionsHeader = page.locator('th:has-text("Actions")').first();
    const nameHeader = page.locator('th:has-text("Name")').first();
    await expect(actionsHeader).toBeVisible();
    await expect(nameHeader).toBeVisible();

    const actionsPosition = await actionsHeader.evaluate((el) => window.getComputedStyle(el).position);
    const namePosition = await nameHeader.evaluate((el) => window.getComputedStyle(el).position);
    
    // MUI components evaluate 'static' style on DOM elements when viewport-responsive positioning is inactive
    expect(['static', 'initial', 'revert']).toContain(actionsPosition);
    expect(['static', 'initial', 'revert']).toContain(namePosition);
  });

  test('displays detailed backend validation error message in edit dialog', async ({ page }) => {
    // Intercept PATCH requests to /venue/v1 and return 400 Bad Request with JSON error message
    await page.route(/\/venue\/v1/, async (route) => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'A valid email is required' }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/admin/venues', { waitUntil: 'domcontentloaded' });

    // Open Edit dialog for venue v1
    const editButton = page.locator('[data-testid="venue-edit-v1"]');
    await editButton.click();

    // Edit email to trigger validation
    const emailInput = page.locator('[data-testid="edit-venue-email"] input');
    await emailInput.fill('invalid@example.com');

    // Click Save
    const saveButton = page.locator('[data-testid="edit-venue-save"]');
    await saveButton.click();

    // Verify that the specific backend error message is displayed, not just "400"
    const errorMessage = page.locator('[data-testid="edit-venue-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('A valid email is required');
  });

  test('proves sticky columns have opaque backgrounds to prevent overlap when scrolled', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop sticky background test is not applicable on mobile');
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/admin/venues', { waitUntil: 'domcontentloaded' });

    // Locate standard sticky Name cell on row v1
    const stickyNameCell = page.locator('tr[data-testid="venue-row-v1"] td.sticky-cell').first();
    await expect(stickyNameCell).toBeVisible();

    // The background of the sticky cell must be opaque (not 'transparent' or rgba(0,0,0,0))
    const background = await stickyNameCell.evaluate((el) => window.getComputedStyle(el).background);
    expect(background).not.toContain('rgba(0, 0, 0, 0)');
    expect(background).not.toBe('transparent');
  });

  test('verifies table header and cell column alignment for Website and Contact', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop table column verification is not applicable on mobile viewports');
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/admin/venues', { waitUntil: 'domcontentloaded' });

    const table = page.locator('[data-testid="venues-table"]');
    await expect(table).toBeVisible();

    // Get all column headers
    const headerRow = table.locator('thead tr');
    const headers = headerRow.locator('th');

    // Verify "Website" and "Contact" headers are visible
    const websiteHeader = headers.filter({ hasText: 'Website' }).first();
    const contactHeader = headers.filter({ hasText: 'Contact' }).first();
    await expect(websiteHeader).toBeVisible();
    await expect(contactHeader).toBeVisible();

    const headerTexts = await headers.allTextContents();
    const cleanHeaders = headerTexts.map((h) => h.trim());
    const websiteIndex = cleanHeaders.findIndex((h) => h.startsWith('Website'));
    const contactIndex = cleanHeaders.findIndex((h) => h.startsWith('Contact'));

    expect(websiteIndex).toBeGreaterThan(-1);
    expect(contactIndex).toBeGreaterThan(-1);
    expect(websiteIndex).toBe(4);
    expect(contactIndex).toBe(5);
    expect(websiteIndex).toBeLessThan(contactIndex);

    // Verify corresponding row cells at those column indices
    const row = table.locator('[data-testid="venue-row-v1"]');
    const cells = row.locator('td');

    const websiteCell = cells.nth(websiteIndex);
    const contactCell = cells.nth(contactIndex);

    // Website column cell corresponds to website link ([data-testid^="venue-website-"])
    await expect(websiteCell).toHaveAttribute('data-testid', 'venue-website-v1');
    const websiteLink = websiteCell.locator('[data-testid^="venue-website-link-"]');
    await expect(websiteLink).toBeVisible();
    await expect(websiteLink).toHaveAttribute('href', 'https://normalactivevenue.com');

    // Contact column cell corresponds to contact action icons ([data-testid^="venue-contact-"])
    await expect(contactCell).toHaveAttribute('data-testid', 'venue-contact-v1');
    const contactNameIcon = contactCell.locator('[data-testid^="venue-contact-name-"]');
    const contactEmailIcon = contactCell.locator('[data-testid^="venue-contact-email-"]');
    await expect(contactNameIcon).toBeVisible();
    await expect(contactEmailIcon).toBeVisible();
  });

  test(
    'opens Add Venue, asserts Zip Code is required, asserts familyNearby selectable, and creates venue',
    async ({ page }) => {
      await page.goto('/admin/venues', { waitUntil: 'domcontentloaded' });

      // Open Add Venue dialog
      const addButton = page.locator('[data-testid="admin-venues-add-button"]');
      await expect(addButton).toBeVisible();
      await addButton.click();

      // Verify dialog title
      await expect(page.locator('[data-testid="edit-venue-dialog-title"]')).toHaveText('Add Venue');

      // Verify familyNearby checkbox is rendered as enabled (selectable)
      const familyNearbyCheckbox = page.locator('[data-testid="edit-venue-family-nearby"] input[type="checkbox"]');
      await expect(familyNearbyCheckbox).toBeEnabled();
      await familyNearbyCheckbox.check();

      // Fill form without zip code
      await page.locator('[data-testid="edit-venue-name"] input').fill('Playwright Test Cafe');
      await page.locator('[data-testid="edit-venue-address"] input').fill('100 Main St');
      await page.locator('[data-testid="edit-venue-state"] input').fill('VA');

      // Save and verify "Zip code is required" error
      await page.locator('[data-testid="edit-venue-save"]').click();
      const errorText = page.locator('[data-testid="edit-venue-error"]');
      await expect(errorText).toBeVisible();
      await expect(errorText).toHaveText('Zip code is required');

      // Intercept POST /venue to verify payload includes zipCode, familyNearby, and omits empty enums.
      // The mock stores what the client sent and serves it back on subsequent GET /venue requests,
      // verifying that the UI correctly reflects the mock round-trip in the table and dialog.
      const captured: {
        payload: {
          name?: string;
          zipCode?: string;
          familyNearby?: unknown;
          templateOverride?: unknown;
          audienceAttention?: unknown;
        } | null;
      } = { payload: null };
      let storedVenue: Record<string, unknown> | null = null;
      await page.route('http://localhost:7000/venue*', async route => {
        if (route.request().method() === 'POST') {
          captured.payload = JSON.parse(route.request().postData() || '{}');
          storedVenue = {
            _id: 'v-new',
            ...captured.payload,
            city: 'Roanoke',
            status: 'active',
          };
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify(storedVenue),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(storedVenue ? [storedVenue] : []),
          });
        }
      });

      // Fill valid zip code and save
      await page.locator('[data-testid="edit-venue-zip"] input').fill('24011');
      await page.locator('[data-testid="edit-venue-save"]').click();

      // Verify payload captured
      await expect.poll(() => captured.payload).not.toBeNull();
      expect(captured.payload?.name).toBe('Playwright Test Cafe');
      expect(captured.payload?.zipCode).toBe('24011');
      expect(captured.payload?.familyNearby).toBe(true);
      expect(captured.payload?.templateOverride).toBeUndefined();
      expect(captured.payload?.audienceAttention).toBeUndefined();

      // Round-trip: the newly created venue appears in the table, and reopening its
      // Edit dialog shows familyNearby checked from the persisted value
      const newVenueEditButton = page.locator('[data-testid="venue-edit-v-new"]');
      await expect(newVenueEditButton).toBeVisible();
      await newVenueEditButton.click();

      await expect(page.locator('[data-testid="edit-venue-dialog-title"]'))
        .toHaveText('Edit Venue — Playwright Test Cafe');
      const reopenedFamilyNearby = page.locator('[data-testid="edit-venue-family-nearby"] input[type="checkbox"]');
      await expect(reopenedFamilyNearby).toBeEnabled();
      await expect(reopenedFamilyNearby).toBeChecked();
    },
  );

  test(
    'proves Score header is opaque and pinned when scrolled, and inline Type and Eligible update row',
    async ({ page, isMobile }) => {
      let updatedVenue = {
        _id: 'v1',
        name: 'Normal Active Venue',
        city: 'Roanoke',
        usState: 'VA',
        venueType: 'Originals',
        status: 'active',
        outreachEligible: true,
        contactVerified: true,
        website: 'https://normalactivevenue.com',
        contactName: 'Jane Doe',
        email: 'jane@example.com',
      };

      const extraVenues = Array.from({ length: 14 }, (_, i) => ({
        _id: `v-extra-${i + 2}`,
        name: `Extra Venue ${i + 2}`,
        city: 'Salem',
        usState: 'VA',
        venueType: 'MidRangeCafeBar',
        status: 'active',
        outreachEligible: false,
        contactVerified: true,
      }));

      await page.route(/localhost:7000\/venue(\/|\?|$)/, async (route) => {
        if (route.request().method() === 'PATCH') {
          const patch = JSON.parse(route.request().postData() || '{}');
          updatedVenue = { ...updatedVenue, ...patch };
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(updatedVenue),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([updatedVenue, ...extraVenues]),
          });
        }
      });

      if (!isMobile) {
        await page.setViewportSize({ width: 1200, height: 800 });
      }

      await page.goto('/admin/venues', { waitUntil: 'domcontentloaded' });

      // Verify Score header exists and has an opaque background
      const scoreHeader = page.locator('[data-testid="header-prospect"]');
      await expect(scoreHeader).toBeVisible();

      const bgBefore = await scoreHeader.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(bgBefore).not.toBe('transparent');
      expect(bgBefore).not.toContain('rgba(0, 0, 0, 0)');

      // On desktop, sticky header position is active
      if (!isMobile) {
        const posBefore = await scoreHeader.evaluate((el) => window.getComputedStyle(el).position);
        expect(posBefore).toBe('sticky');
      }

      // Scroll table container vertically to verify header stays pinned and visible
      const table = page.locator('[data-testid="venues-table"]');
      await table.evaluate((el) => {
        el.parentElement?.scrollBy(0, 300);
      });

      await expect(scoreHeader).toBeVisible();
      const bgAfter = await scoreHeader.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(bgAfter).not.toBe('transparent');
      expect(bgAfter).not.toContain('rgba(0, 0, 0, 0)');

      // Scroll back to top so row v1 controls are fully in view
      await table.evaluate((el) => {
        el.parentElement?.scrollTo(0, 0);
      });

      // (b) Test inline editing: change row's Type to PubFestivalBrewery
      const typeSelect = page.locator('[data-testid="venue-type-select-v1"]');
      await expect(typeSelect).toBeVisible();
      await expect(typeSelect).toHaveText('Originals');
      await typeSelect.click();

      const pubOption = page.locator('[data-testid="venue-type-option-PubFestivalBrewery"]');
      await expect(pubOption).toBeVisible();
      await pubOption.click();

      // Verify the type updated in UI after automatic refresh
      await expect(typeSelect).toHaveText('PubFestivalBrewery');

      // (b) Test inline editing: toggle Eligible switch to false
      const eligibleToggle = page.locator('[data-testid="venue-eligible-toggle-v1"] input[type="checkbox"]');
      await expect(eligibleToggle).toBeVisible();
      await expect(eligibleToggle).toBeChecked();

      await eligibleToggle.click();

      // Verify eligible switch is toggled off after automatic refresh
      await expect(eligibleToggle).not.toBeChecked();
    },
  );

  test(
    'toggles readiness filter chips and filters table rows with live count badges',
    async ({ page }) => {
      const mockVenues = [
        {
          _id: 'v-pitch-ready',
          name: 'Pitch Ready Venue',
          city: 'Roanoke',
          usState: 'VA',
          venueType: 'Originals',
          status: 'active',
          outreachEligible: true,
          contactVerified: true,
          email: 'booking@pitchready.com',
        },
        {
          _id: 'v-needs-type',
          name: 'Needs Type Venue',
          city: 'Salem',
          usState: 'VA',
          venueType: undefined,
          status: 'active',
          outreachEligible: true,
          contactVerified: true,
          email: 'info@needstype.com',
        },
        {
          _id: 'v-missing-email',
          name: 'Missing Email Venue',
          city: 'Roanoke',
          usState: 'VA',
          venueType: 'MidRangeCafeBar',
          status: 'active',
          outreachEligible: true,
          contactVerified: true,
          email: undefined,
        },
        {
          _id: 'v-ineligible',
          name: 'Ineligible Venue',
          city: 'Salem',
          usState: 'VA',
          venueType: 'PubFestivalBrewery',
          status: 'active',
          outreachEligible: false,
          contactVerified: true,
          email: 'info@ineligible.com',
        },
      ];

      await page.route(/localhost:7000\/venue(\/|\?|$)/, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockVenues),
        });
      });

      await page.goto('/admin/venues', { waitUntil: 'domcontentloaded' });

      // Verify readiness filter chip toolbar is visible
      const filtersBar = page.locator('[data-testid="venues-readiness-filters"]');
      await expect(filtersBar).toBeVisible();

      // Verify live count badges: 4 total, 1 needs type, 1 missing email, 1 pitch ready
      await expect(page.locator('[data-testid="venues-filter-all-count"]')).toHaveText('4');
      await expect(page.locator('[data-testid="venues-filter-needs-type-count"]')).toHaveText('1');
      await expect(page.locator('[data-testid="venues-filter-missing-email-count"]')).toHaveText('1');
      await expect(page.locator('[data-testid="venues-filter-pitch-ready-count"]')).toHaveText('1');

      // All chip is selected by default and displays all 4 active venues
      const allChip = page.locator('[data-testid="venues-filter-all"]');
      await expect(allChip).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('[data-testid^="venue-row-"]')).toHaveCount(4);

      // Click Needs Type chip: filters strictly to venues missing venueType
      const needsTypeChip = page.locator('[data-testid="venues-filter-needs-type"]');
      await needsTypeChip.click();
      await expect(needsTypeChip).toHaveAttribute('aria-pressed', 'true');
      await expect(allChip).toHaveAttribute('aria-pressed', 'false');
      await expect(page.locator('[data-testid^="venue-row-"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="venue-row-v-needs-type"]')).toBeVisible();

      // Click Missing Email chip: filters strictly to venues missing email
      const missingEmailChip = page.locator('[data-testid="venues-filter-missing-email"]');
      await missingEmailChip.click();
      await expect(missingEmailChip).toHaveAttribute('aria-pressed', 'true');
      await expect(needsTypeChip).toHaveAttribute('aria-pressed', 'false');
      await expect(page.locator('[data-testid^="venue-row-"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="venue-row-v-missing-email"]')).toBeVisible();

      // Click Pitch-Ready chip: filters strictly to venues having type, email, and not ineligible
      const pitchReadyChip = page.locator('[data-testid="venues-filter-pitch-ready"]');
      await pitchReadyChip.click();
      await expect(pitchReadyChip).toHaveAttribute('aria-pressed', 'true');
      await expect(missingEmailChip).toHaveAttribute('aria-pressed', 'false');
      await expect(page.locator('[data-testid^="venue-row-"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="venue-row-v-pitch-ready"]')).toBeVisible();

      // Switch back to All chip: restores all rows
      await allChip.click();
      await expect(allChip).toHaveAttribute('aria-pressed', 'true');
      await expect(pitchReadyChip).toHaveAttribute('aria-pressed', 'false');
      await expect(page.locator('[data-testid^="venue-row-"]')).toHaveCount(4);
    },
  );
});
