import 'core-js/stable';
import 'regenerator-runtime/runtime';

describe('Music', () => {
  it('should be titled "Music | Web Jam LLC"', async () => {
    await page.goto('http://localhost:7878/music', { waitUntil: 'load' });
    await expect(page.title()).resolves.toMatch('Music | Web Jam LLC');
  });
});
