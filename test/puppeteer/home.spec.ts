describe('Home', () => {
  it('should be titled "Web Jam LLC"', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:7878/', {
      waitUntil: 'load',
    });
    await expect(page.title()).resolves.toMatch('Web Jam LLC');
  });
});
