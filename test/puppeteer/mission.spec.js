import "core-js/stable";
import "regenerator-runtime/runtime";

describe("Mission Music", () => {
  it('should be titled "Mission Music | Web Jam LLC"', async () => {
    await page.goto("http://localhost:7000/wj-music/mission", {
      waitUntil: "load"
    });
    await expect(page.title()).resolves.toMatch("Mission Music | Web Jam LLC");
  });
});
