import 'core-js/stable';
import 'regenerator-runtime/runtime';

describe('Buy Music', () => {
  it('should be titled "Buy Music | Web Jam LLC"', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:7878/music/buymusic', {
      waitUntil: 'load',
    });
    await expect(page.title()).resolves.toMatch('Buy Music | Web Jam LLC');
  });
});
