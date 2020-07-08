import commonUtils from '../lib/commonUtils';

const continueMenuItem = (menu: { link: any; name?: string; type: any; auth?: any; },
  index: any, location: { pathname: string; },
  auth: { isAuthenticated: any; },
  view: {
    props?: { location: any; auth: any; };
    makeMenuLink: any; googleButtons?: any;
  }): any => {
  if (menu.type === 'googleLogin' && !auth.isAuthenticated) return view.googleButtons('login', index);
  if (menu.type === 'googleLogout' && auth.isAuthenticated) return view.googleButtons('logout', index);
  return null;
};

const menuItem = (menu: { link: string | string[]; name: string; type: string; auth: any; },
  index: any,
  view: {
    props: { location: any; auth: any; };
    makeMenuLink: (arg0: any, arg1: any) => any;
  }): any => {
  const userRoles: any[] = commonUtils.getUserRoles();
  const { location, auth } = view.props;
  if ((menu.name === 'Dashboard' || menu.name === 'Map') && (!auth.isAuthenticated || userRoles.indexOf(auth.user.userType) === -1)) return null;
  if (location.pathname.includes('/music') && (menu.link.includes('/music') || menu.name === 'Web Jam LLC')) {
    return view.makeMenuLink(menu, index);
  }
  if ((location.pathname === '/' || location.pathname === '/map')
    && (menu.link === '/map' || menu.link === '/music' || menu.link === '/' || menu.link.includes('/dashboard'))) {
    return view.makeMenuLink(menu, index);
  }
  return continueMenuItem(menu, index, location, auth, view);
};

export default { continueMenuItem, menuItem };
