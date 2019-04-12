exports.childRoute = function childroute(module) {
  if (module.user.userStatus === 'disabled') {
    return module.app.router.navigate('dashboard/user-account');
  }
  if (module.user.userType === undefined || module.user.userType === '') {
    module.user.userDetails = 'newUser';
    if (module.user.isOhafUser) module.user.userType = 'Volunteer';
    else module.user.userType = 'user-account';
    module.app.appState.setUser(module.user);
    return module.app.router.navigate('dashboard/user-account');
  }
  return module.app.router.navigate(`dashboard/${module.user.userType.toLowerCase()}`);
};

exports.subRoute = async function subRoute(module, ls) {
  module.uid = await module.app.auth.getTokenPayload().sub;
  if (module.uid === null || module.uid === undefined) return module.app.logout();
  module.user = await module.app.appState.getUser(module.uid);
  ls.setItem('userEmail', module.user.email);
  return this.childRoute(module);
};
