const ohafUtils = require('../../src/commons/ohafUtils');

const volStub = {
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
volStub.commonUtils = {
  formatDate() {
    return '20181104';
  }
};
docStub = {
  getElementsByClassName() {
    return [{
      innerHTML: ''
    }];
  }
};
describe('the ohaf utils module', () => {
  it('does nothing', (done) => {
    done();
  });
  it('double checks signups', async () => {
    try {
      await ohafUtils.doubleCheckSignups({}, volStub, docStub);
    } catch (e) {
      throw e;
    }
  });
  it('catches error on double checks signups', async () => {
    volStub.app.httpClient.fetch = function fetch() {
      return Promise.reject(new Error('bad'));
    };
    try {
      await ohafUtils.doubleCheckSignups({}, volStub, docStub);
    } catch (e) {
      expect(e.message).toBe('bad');
    }
  });
  it('double checks signups but date is past', async () => {
    volStub.app.httpClient.fetch = function fetch() {
      return Promise.resolve({
        json() {
          return Promise.resolve({
            voStartDate: '2018-10-31'
          });
        }
      });
    };
    let res;
    try {
      res = await ohafUtils.doubleCheckSignups({}, volStub, docStub);
      expect(res).toBe(false);
    } catch (e) {
      throw e;
    }
  });
  it('double checks signups but max people were reached', async () => {
    volStub.app.httpClient.fetch = function fetch() {
      return Promise.resolve({
        json() {
          return Promise.resolve({
            voStartDate: '2018-11-31',
            voPeopleScheduled: ['123', '456'],
            voNumPeopleNeeded: 1
          });
        }
      });
    };
    let res;
    try {
      res = await ohafUtils.doubleCheckSignups({}, volStub, docStub);
      expect(res).toBe(false);
    } catch (e) {
      throw e;
    }
  });
  it('double checks signups successfully', async () => {
    volStub.app.httpClient.fetch = function fetch() {
      return Promise.resolve({
        json() {
          return Promise.resolve({
            voStartDate: '2018-11-31',
            voPeopleScheduled: ['123', '456'],
            voNumPeopleNeeded: 3
          });
        }
      });
    };
    let res;
    try {
      res = await ohafUtils.doubleCheckSignups({}, volStub, docStub);
      expect(res).toBe(true);
    } catch (e) {
      throw e;
    }
  });
  it('tries to signup, but cannot', async () => {
    ohafUtils.doubleCheckSignups = function doubleCheckSignups() {
      return Promise.reject(new Error('bad'));
    };
    let result;
    try {
      result = await ohafUtils.signupEvent({}, { canSignup: false, app: { logout() { return Promise.resolve('logged out'); } } }, {});
      expect(result).toBe('logged out');
    } catch (e) {
      throw e;
    }
  });
  it('tries to signup, but throws error and logs out', async () => {
    ohafUtils.doubleCheckSignups = function doubleCheckSignups() {
      return Promise.resolve(false);
    };
    let res;
    try {
      res = await ohafUtils.signupEvent({ voPeopleScheduled: [], _id: '' }, {
        canSignup: true,
        checkScheduled() {},
        fetchAllEvents() { return Promise.resolve(true); },
        app: {
          updateById() { return Promise.resolve(true); },
          router: { navigate() { } },
        }
      }, {});
      expect(typeof res).toBe('object');
      await ohafUtils.signupEvent({ voPeopleScheduled: [], _id: '' }, { canSignup: false }, {});
    } catch (e) {
      throw e;
    }
  });
  it('updates the user', async () => {
    volStub.app.updateById = function updateById() {
      return Promise.resolve(true);
    };
    volStub.activate = function activate() {
      return Promise.resolve(true);
    };
    let res;
    try {
      res = await ohafUtils.updateUser(volStub, {
        location: {
          reload() {}
        }
      });
      expect(res).toBe(true);
    } catch (e) {
      throw e;
    }
  });
  it('attaches to volunteer page', async () => {
    volStub.setupVolunteerUser = function setupVolunteerUser() {};
    const doc = {
      getElementsByClassName() {
        return [{
          style: {
            top: ''
          }
        }];
      },
      documentElement: {
        clientWidth: 700
      },
      getElementById() {
        return {
          addEventListener() {}
        };
      }
    };
    let res;
    try {
      res = await ohafUtils.attachVolPage(doc, volStub);
      expect(res).toBe(true);
    } catch (e) {
      throw e;
    }
  });
  it('attaches to volunteer page when widescreen', async () => {
    volStub.setupVolunteerUser = function setupVolunteerUser() {};
    const doc = {
      getElementsByClassName() {
        return [{
          style: {
            top: ''
          }
        }];
      },
      documentElement: {
        clientWidth: 900
      },
      getElementById() {
        return {
          addEventListener() {}
        };
      }
    };
    let res;
    try {
      res = await ohafUtils.attachVolPage(doc, volStub);
      expect(res).toBe(true);
    } catch (e) {
      throw e;
    }
  });
});
