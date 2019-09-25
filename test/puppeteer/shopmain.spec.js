import 'core-js/stable';
import 'regenerator-runtime/runtime';

describe('ShopMain', () => {
  it('should be titled "Shop | Web Jam LLC"', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:7878/shop', {
      waitUntil: 'load',
    });
    // console.log(page);
    // await expect(page.title()).resolves.toMatch('Shop | Web Jam LLC');
  });
});
