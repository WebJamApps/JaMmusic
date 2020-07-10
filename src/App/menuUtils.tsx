import { Auth } from '../redux/mapStoreToProps';
import commonUtils from '../lib/commonUtils';
import { ImenuItem } from './menuItems';
import type { AppTemplate } from './AppTemplate';

const continueMenuItem = (menu: ImenuItem,
  index: number,
  auth: Auth,
  view: AppTemplate): JSX.Element | null => {
  if (menu.type === 'googleLogin' && !auth.isAuthenticated) return view.googleButtons('login', index);
  if (menu.type === 'googleLogout' && auth.isAuthenticated) return view.googleButtons('logout', index);
  return null;
};

const menuItem = (menu: ImenuItem,
  index: number,
  view: AppTemplate): JSX.Element | null => {
  const userRoles: string[] = commonUtils.getUserRoles();
  const { location, auth } = view.props;
  if (menu.auth && (!auth.isAuthenticated || userRoles.indexOf(auth.user.userType) === -1)) return null;
  if (location.pathname.includes('/music') && (menu.link.includes('/music') || menu.name === 'Web Jam LLC')) {
    return view.makeMenuLink(menu, index);
  }
  if (menu.link === '/map' || menu.link === '/music' || menu.link === '/' || menu.link.includes('/dashboard')) {
    return view.makeMenuLink(menu, index);
  }
  return continueMenuItem(menu, index, auth, view);
};

export default { continueMenuItem, menuItem };
