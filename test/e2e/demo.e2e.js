
const { config } = require('../protractor.conf');

describe('joshandmariamusic.com', () => {
  it('should have a title', () => {
    browser.get(`http://localhost:${config.port}`);

    expect(browser.getTitle()).toEqual('Web Jam LLC');
  });
});
