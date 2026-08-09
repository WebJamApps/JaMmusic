import { test, expect } from '@playwright/test';

test('music player sorts songs by orderBy priority descending', async ({ page }) => {
  await page.route(/\/song/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          _id: 's1',
          title: 'Low Priority Song',
          artist: 'Test Artist',
          category: 'original',
          year: 2020,
          orderBy: 1,
          url: 'https://example.com/low.mp3',
        },
        {
          _id: 's2',
          title: 'High Priority Song',
          artist: 'Test Artist',
          category: 'original',
          year: 2018,
          orderBy: 10,
          url: 'https://example.com/high.mp3',
        },
      ]),
    });
  });

  await page.goto('/music/songs', { waitUntil: 'domcontentloaded' });

  // The first song listed should be 'High Priority Song' because orderBy 10 > orderBy 1
  const playerText = page.locator('.textUnderPlayer');
  await expect(playerText).toContainText('High Priority Song');
});
