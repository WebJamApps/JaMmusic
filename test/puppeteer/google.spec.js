import 'core-js/stable';
import 'regenerator-runtime/runtime';

describe('Google', () => {
  it('should be titled "Google"', async () => {
    const page = await browser.newPage();
    await page.goto('https://google.com', { waitUntil: 'load' });
    await expect(page.title()).resolves.toMatch('Google');
  });
});
