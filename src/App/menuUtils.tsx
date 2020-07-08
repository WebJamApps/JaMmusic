const continueMenuItem = (menu: { link: any; name?: string; type: any; auth?: any; },
  index: any, location: { pathname: string; },
  auth: { isAuthenticated: any; },
  controller: {
    props?: { location: any; auth: any; };
    makeMenuLink: any; googleButtons?: any;
  }): any => {
  if (menu.type === 'googleLogin' && !auth.isAuthenticated) return controller.googleButtons('login', index);
  if (menu.type === 'googleLogout' && auth.isAuthenticated) return controller.googleButtons('logout', index);
  return null;
};

const menuItem = (menu: { link: string | string[]; name: string; type: string; auth: any; },
  index: any,
  controller: {
    props: { location: any; auth: any; };
    makeMenuLink: (arg0: any, arg1: any) => any;
  }): any => {
  const { location, auth } = controller.props;
  if (location.pathname.includes('/music') && (menu.link.includes('/music') || menu.name === 'Web Jam LLC')) {
    if ((menu.type === 'link' && ((menu.auth && auth.isAuthenticated && auth.user.userType === 'Developer') || !menu.auth))) {
      return controller.makeMenuLink(menu, index);
    }
  }
  if (location.pathname === '/' && (menu.link === '/shop' || menu.link === '/music' || menu.link === '/')) {
    return controller.makeMenuLink(menu, index);
  }
  return continueMenuItem(menu, index, location, auth, controller);
};

export default { continueMenuItem, menuItem };
