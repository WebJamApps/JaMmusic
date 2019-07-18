import 'core-js/stable';
import 'regenerator-runtime/runtime';

describe('Buy Music', () => {
  it('should be titled "Buy Music | Web Jam LLC"', async () => {
    await page.goto('http://localhost:7000/music/buymusic', {
      waitUntil: 'load',
    });
    await expect(page.title()).resolves.toMatch('Buy Music | Web Jam LLC');
  });
});
