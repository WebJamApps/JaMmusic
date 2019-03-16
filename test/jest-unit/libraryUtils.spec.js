const libraryUtils = require('../../src/commons/libraryUtils');

const readerStub = {
  app: {
    httpClient: {
      fetch() {
        return Promise.resolve({
          json() {
            return Promise.resolve({});
          }
        });
      }
    }
  }
};
readerStub.app.auth = {
  isAuthenticated() {
    return true;
  },
  getTokenPayload() { return { sub: '123' }; }
};
readerStub.app.appState = {
  getUser() { return {}; }
};
describe('the library utils module', () => {
  it('checks for a reader when authenticated', async () => {
    let res;
    try {
      res = await libraryUtils.checkReader(readerStub);
      expect(res).toBe(true);
    } catch (e) {
      throw e;
    }
  });
  it('does not check for a reader when not authenticated', async () => {
    readerStub.app.auth.isAuthenticated = function isAuthenticated() { return false; };
    let res;
    try {
      res = await libraryUtils.checkReader(readerStub);
      expect(res).toBe(true);
    } catch (e) {
      throw e;
    }
  });
});
