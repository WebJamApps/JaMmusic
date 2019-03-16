exports.checkReader = async function checkReader(module) {
  if (module.app.auth.isAuthenticated()) {
    module.uid = module.app.auth.getTokenPayload().sub;
    module.user = await module.app.appState.getUser(module.uid);
    if (module.user.userType === 'Reader' || module.user.userType === 'Developer') module.reader = true;
  }
  return Promise.resolve(true);
};
