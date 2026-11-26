import { test, expect } from '@playwright/test';

// The privacy policy is public: a signed-out visitor opens its address directly.
test.describe('Privacy policy', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeWebSocket(/.*/, (ws) => {
      ws.onMessage((message) => {
        if (typeof message !== 'string' || !message.startsWith('{')) return;
        const packet = JSON.parse(message) as { event?: string; cid?: number };
        if (packet.event === '#handshake') {
          ws.send(JSON.stringify({ rid: packet.cid, data: { id: 'fixture', pingTimeout: 20000, isAuthenticated: false } }));
        }
      });
    });
    await page.route(/^https:\/\/accounts\.google\.com/, (route) => route.abort());
    await page.route(/localhost:7000/, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  });

  test('opens at /privacy without signing in', async ({ page }) => {
    await page.goto('/privacy', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/privacy$/);
    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'What web-jam.com collects' })).toBeVisible();
  });
});
