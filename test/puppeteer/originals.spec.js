import 'core-js/stable';
import 'regenerator-runtime/runtime';

describe('Originals', () => {
  it('should be titled "Originals | Web Jam LLC"', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:7878/music/originals', {
      waitUntil: 'load',
    });
    await expect(page.title()).resolves.toMatch('Originals | Web Jam LLC');
  });
});
