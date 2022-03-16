
import type { Auth } from '../redux/mapStoreToProps';
import commonUtils from '../lib/commonUtils';
import type { ImenuItem } from './menuItems';
import type { AppTemplate, AppTemplateProps } from './AppTemplate';
import { GoogleButtons } from './GoogleButtons';

const continueMenuItem = (
  menu: ImenuItem,
  index: number,
  auth: Auth,
  appTemplateProps: AppTemplateProps,
): JSX.Element | null => {
  // console.log(auth);
  // console.log(menu.type);
  if (menu.type === 'googleLogin' && !auth.isAuthenticated) {
    return <GoogleButtons key="googleLogin" type="login" index={index} appTemplateProps={appTemplateProps}/>;
  }
  if (menu.type === 'googleLogout' && auth.isAuthenticated) {
    // console.log(auth);
    return <GoogleButtons key="googleLogout" type="logout" index={index} appTemplateProps={appTemplateProps}/>;
  }
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
  if (menu.type === 'link' && !menu.link.includes('/music/') && !location.pathname.includes('/music')) return view.makeMenuLink(menu, index);
  return continueMenuItem(menu, index, auth, view.props);
};

const makeIconAndText = (menu:ImenuItem): JSX.Element => (
  <div style={{ display: 'inline' }}>
    <i className={`${menu.iconClass}`} />
    &nbsp;
    <span className="nav-item">{menu.name}</span>
  </div>
);

export default { continueMenuItem, menuItem, makeIconAndText };
