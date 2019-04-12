const dashboardUtils = require('../../src/commons/dashboardUtils');

const dashboardStub = {
  user: {},
  uid: '',
  app: { auth: { getTokenPayload() { return { sub: Promise.resolve('123') }; } },
    appState: { getUser() { return { email: 'jb@jb.com', userType: 'Reader' }; }, setUser() {} },
    router: { navigate(route) { return route; } },
    logout() { return Promise.resolve(true); }
  }
};

const dashboardStub2 = {
  user: {},
  uid: '',
  app: { auth: { getTokenPayload() { return Promise.resolve({ sub: null }); } },
    appState: { getUser() { return { email: 'jb@jb.com', userType: 'Reader' }; }, setUser() {} },
    router: { navigate(route) { return route; } },
    logout() { return Promise.resolve(true); }
  }
};

const lsStub = {
  setItem() {}
};

describe('the dashboard utils', () => {
  it('routes disabled users', (done) => {
    dashboardStub.user.userStatus = 'disabled';
    const res = dashboardUtils.childRoute(dashboardStub);
    expect(res).toBe('dashboard/user-account');
    done();
  });
  it('routes new users', (done) => {
    dashboardStub.user.userStatus = '';
    dashboardStub.user.userType = '';
    const res = dashboardUtils.childRoute(dashboardStub);
    expect(res).toBe('dashboard/user-account');
    done();
  });
  it('routes new ohaf users', (done) => {
    dashboardStub.user.userStatus = '';
    dashboardStub.user.userType = '';
    dashboardStub.user.isOhafUser = true;
    const res = dashboardUtils.childRoute(dashboardStub);
    expect(res).toBe('dashboard/user-account');
    done();
  });
  it('logs out a users', async () => {
    dashboardStub2.user.userStatus = '';
    dashboardStub2.user.userType = '';
    dashboardStub2.user.isOhafUser = true;
    const res = await dashboardUtils.subRoute(dashboardStub2, lsStub);
    expect(res).toBe(true);
  });
  it('allows routing', async () => {
    let res;
    try {
      res = await dashboardUtils.subRoute(dashboardStub, lsStub);
    } catch (e) { throw e; }
  });
});
