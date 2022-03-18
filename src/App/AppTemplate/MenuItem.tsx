
import type { Auth } from '../../redux/mapStoreToProps';
import commonUtils from '../../lib/commonUtils';
import type { ImenuItem } from './menuConfig';
import type { AppTemplate, AppTemplateProps } from '.';
import { GoogleButtons } from '../GoogleButtons';

const continueMenuItem = (
  menu: ImenuItem,
  index: number,
  auth: Auth,
  appTemplateProps: AppTemplateProps,
): JSX.Element | null => {
  if (menu.type === 'googleLogin' && !auth.isAuthenticated) {
    return <GoogleButtons key="googleLogin" type="login" index={index} appTemplateProps={appTemplateProps}/>;
  }
  if (menu.type === 'googleLogout' && auth.isAuthenticated) {
    return <GoogleButtons key="googleLogout" type="logout" index={index} appTemplateProps={appTemplateProps}/>;
  }
  return null;
};

interface ImenuItemProps {menu:ImenuItem, index:number, view:AppTemplate}
export const MenuItem = ({ menu, index, view }:ImenuItemProps): JSX.Element | null => {
  const userRoles: string[] = commonUtils.getUserRoles();
  const { location, auth } = view.props;
  if (menu.auth && (!auth.isAuthenticated || userRoles.indexOf(auth.user.userType) === -1)) return null;
  if (location.pathname.includes('/music') && (menu.link.includes('/music') || menu.name === 'Web Jam LLC')) {
    return view.makeMenuLink(menu, index);
  }
  if (menu.type === 'link' && !menu.link.includes('/music/') && !location.pathname.includes('/music')) return view.makeMenuLink(menu, index);
  return continueMenuItem(menu, index, auth, view.props);
};

export const IconAndText = ({ menu }:{ menu:ImenuItem }): JSX.Element => (
  <div style={{ display: 'inline' }}>
    <i className={`${menu.iconClass}`} />
    &nbsp;
    <span className="nav-item">{menu.name}</span>
  </div>
);

