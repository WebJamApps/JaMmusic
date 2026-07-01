import { test, expect } from '@playwright/test';

test.describe('Sidebar navigation alignment regression tests', () => {
  test.beforeEach(async ({ context }) => {
    // Seed localStorage to simulate a logged-in Developer/Admin user,
    // which renders the complete list of admin menu links in the sidebar.
    await context.addInitScript(() => {
      try {
        const authData = {
          isAuthenticated: true,
          error: '',
          token: 'mock-jwt-token',
          user: {
            userType: 'Developer',
            email: 'joshua@web-jam.com'
          }
        };
        localStorage.setItem('auth', JSON.stringify(authData));
      } catch { /* ignore */ }
    });
  });

  test('all sidebar navigation items are left-aligned and use flex layout', async ({ page }) => {
    // Navigate to homepage where the sidebar renders
    await page.goto('/', { waitUntil: 'networkidle' });

    // Open the sidebar if we are in mobile/collapsed view
    const menuToggle = page.locator('#mobilemenutoggle');
    if (await menuToggle.isVisible()) {
      await menuToggle.click();
      // Wait for slide animation/transition to complete
      await page.waitForTimeout(500);
    }

    // Wait for the menu items to be rendered and visible
    const menuItems = page.locator('.menu-item');
    await expect(menuItems.first()).toBeVisible();

    // Query details of all navigation links
    const linkLayouts = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('.menu-item .nav-link'));
      return links.map(link => {
        const computedStyle = window.getComputedStyle(link);
        const contentEl = link.querySelector('.nav-link-content');
        const contentComputedStyle = contentEl ? window.getComputedStyle(contentEl) : null;
        const icon = link.querySelector('i');
        const textSpan = link.querySelector('.nav-item');

        return {
          text: link.textContent?.trim() || '',
          linkDisplay: computedStyle.display,
          linkTextAlign: computedStyle.textAlign,
          contentDisplay: contentComputedStyle ? contentComputedStyle.display : null,
          contentAlignItems: contentComputedStyle ? contentComputedStyle.alignItems : null,
          hasIcon: !!icon,
          iconLeft: icon ? icon.getBoundingClientRect().left : null,
          textLeft: textSpan ? textSpan.getBoundingClientRect().left : null,
        };
      });
    });

    // Ensure we have menu items to verify
    expect(linkLayouts.length).toBeGreaterThan(0);

    // Verify layout properties for each link
    for (const layout of linkLayouts) {
      // 1. Text alignment on the block-level .nav-link must be explicitly left
      expect(layout.linkTextAlign).toBe('left');

      // 2. The flexbox container .nav-link-content must be display: flex and centered vertically
      if (layout.text !== 'Dark Mode' && layout.text !== 'Light') {
        expect(layout.contentDisplay).toBe('flex');
        expect(layout.contentAlignItems).toBe('center');
      }

      // 3. For items with icons, verify that both the icons and the start of text
      // align perfectly at a uniform X position respectively across all items.
      if (layout.hasIcon && layout.iconLeft !== null && layout.textLeft !== null) {
        // Find reference values from the first item to ensure perfect consistency
        const firstWithIcon = linkLayouts.find(l => l.hasIcon && l.iconLeft !== null);
        if (firstWithIcon && firstWithIcon.iconLeft !== null && firstWithIcon.textLeft !== null) {
          // Allow small layout differences (within 1px tolerance) for browser subpixel rendering
          expect(Math.abs(layout.iconLeft - firstWithIcon.iconLeft)).toBeLessThanOrEqual(1);
          expect(Math.abs(layout.textLeft - firstWithIcon.textLeft)).toBeLessThanOrEqual(1);
        }
      }
    }
  });
});
