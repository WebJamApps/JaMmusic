import commonUtils from '../lib/commonUtils';

const continueMenuItem = (menu: { link: string; name?: string; type: string; auth?: boolean; },
  index: number, location: { pathname: string; },
  auth: { isAuthenticated: any; },
  view: {
    props?: { location: any; auth: any; };
    makeMenuLink: any; googleButtons?: any;
  }): any => {
  if (menu.type === 'googleLogin' && !auth.isAuthenticated) return view.googleButtons('login', index);
  if (menu.type === 'googleLogout' && auth.isAuthenticated) return view.googleButtons('logout', index);
  return null;
};

const menuItem = (menu: { link: string; name: string; type: string; auth: boolean; },
  index: number,
  view: {
    props: { location: any; auth: any; };
    makeMenuLink: (arg0: any, arg1: any) => any;
  }): any => {
  const userRoles: any[] = commonUtils.getUserRoles();
  const { location, auth } = view.props;
  if (menu.auth && (!auth.isAuthenticated || userRoles.indexOf(auth.user.userType) === -1)) return null;
  if (location.pathname.includes('/music') && (menu.link.includes('/music') || menu.name === 'Web Jam LLC')) {
    return view.makeMenuLink(menu, index);
  }
  if (menu.link === '/map' || menu.link === '/music' || menu.link === '/' || menu.link.includes('/dashboard')) {
    return view.makeMenuLink(menu, index);
  }
  return continueMenuItem(menu, index, location, auth, view);
};

export default { continueMenuItem, menuItem };
