import 'core-js/stable';
import 'regenerator-runtime/runtime';

describe('Pub Songs', () => {
  it('should be titled "Pub Songs | Web Jam LLC"', async () => {
    await page.goto('http://localhost:7000/wj-music/pub', {
      waitUntil: 'load',
    });
    await expect(page.title()).resolves.toMatch('Pub Songs | Web Jam LLC');
  });
});
