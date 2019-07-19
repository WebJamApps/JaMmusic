import 'core-js/stable';
import 'regenerator-runtime/runtime';

describe('Home', () => {
  it('should be titled "Web Jam LLC"', async () => {
    await page.goto('http://localhost:7878/', { waitUntil: 'load' });
    await expect(page.title()).resolves.toMatch('Web Jam LLC');
  });
});
