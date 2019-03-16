export class PageObjectSkeleton {
  getCurrentPageTitle() {
    return browser.getTitle();
  }

  sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }


  async navigateTo(href) {
    const navigatingReady = browser.waitForRouterComplete();
    await element(by.css(`a[href="${href}"]`)).click();
    await navigatingReady;
  }
}
