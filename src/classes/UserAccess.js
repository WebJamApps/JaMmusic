export class UserAccess {
  constructor(appState) {
    this.appState = appState;
    // this.userStatus = this.appState.getUser().status;
  }

  run(routingContext, next) {
    // document.getElementById('top').scrollIntoView();
    // if we need to authenticate / authorize, verify the logged in users roles here.
    return this.appState.getRoles().then((userRoles) => {
      if (routingContext.config.auth) {
        // console.log('I am entering a route that requires auth');
        // console.log('These are my roles: ' + userRoles);
        // console.log('The main route is: ' + routingContext.fragment);

        // if (routingContext.fragment === '/dashboard'){
        //   //console.log('I am only trying to go to the main dashboard');
        //   return next();
        // }

        // console.log('The child route is: ' + routingContext.params.childRoute);
        if (routingContext.params.childRoute === 'user-account' || routingContext.fragment === '/dashboard') {
          return next();
        }
        //
        // if (routingContext.params.childRoute === 'librarian'){
        //   return next();
        // }
        //
        // if (routingContext.params.childRoute === 'charity'){
        //   return next();
        // }
        //
        // if (routingContext.params.childRoute === 'volunteer'){
        //   return next();
        // }
        //
        // if (routingContext.params.childRoute === 'developer'){
        //   return next();
        // }


        for (let i = 0; i < userRoles.length; i += 1) {
          // console.log(routingContext.params.childRoute);
          // console.log(userRoles[i].toLowerCase());
          // in this case the user is only in one role at a time.
          if (userRoles.indexOf('disabled') === -1 && (routingContext.params.childRoute === userRoles[i].toLowerCase()
          || (routingContext.params.childRoute.indexOf('vol-ops/') !== -1 && userRoles[i].toLowerCase() === 'charity'))) {
            return next();
          }
          // if (routingContext.params.childRoute.indexOf('vol-ops/') !== -1 && userRoles[i].toLowerCase() === 'charity') {
          //   // console.log(routingContext.fragment);
          //   // console.log(routingContext.params.childRoute);
          //   return next();
          // }
        }
        return next.cancel();
      }
      // console.log('this route does not require auth, so let them go through');
      return next();
    });
  }
}
