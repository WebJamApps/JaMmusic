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
    await page.route((url) => url.pathname === '/venue' || url.pathname.startsWith('/venue/'), async (route) => {
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
    await page.goto('/admin/venues', { waitUntil: 'networkidle' });

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
    await page.goto('/admin/venues', { waitUntil: 'networkidle' });

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
    await page.goto('/admin/venues', { waitUntil: 'networkidle' });

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
    await page.goto('/admin/venues', { waitUntil: 'networkidle' });

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
    // Intercept PUT requests to /venue/v1 and return 400 Bad Request with JSON error message
    await page.route(/\/venue\/v1/, async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'A valid email is required' }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/admin/venues', { waitUntil: 'networkidle' });

    // Open Edit dialog for venue v1
    const editButton = page.locator('[data-testid="venue-edit-v1"]');
    await editButton.click();

    // Edit email to trigger validation
    const emailInput = page.locator('[data-testid="edit-venue-email"] input');
    await emailInput.fill('invalid-email');

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
    await page.goto('/admin/venues', { waitUntil: 'networkidle' });

    // Locate standard sticky Name cell on row v1
    const stickyNameCell = page.locator('tr[data-testid="venue-row-v1"] td.sticky-cell').first();
    await expect(stickyNameCell).toBeVisible();

    // The background of the sticky cell must be opaque (not 'transparent' or rgba(0,0,0,0))
    const background = await stickyNameCell.evaluate((el) => window.getComputedStyle(el).background);
    expect(background).not.toContain('rgba(0, 0, 0, 0)');
    expect(background).not.toBe('transparent');
  });
});
