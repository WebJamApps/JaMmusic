
import { Link, RouteComponentProps } from 'react-router-dom';
import type { Dispatch } from 'react';
import type { Auth } from '../../redux/mapStoreToProps';
import commonUtils from '../../lib/commonUtils';
import type { ImenuItem } from './menuConfig';
import { GoogleButtons } from './GoogleButtons';

export const continueMenuItem = (
  menu: ImenuItem,
  index: number,
  auth: Auth,
  pathname: string,
  dispatch: Dispatch<unknown>,
): JSX.Element | null => {
  if (menu.type === 'googleLogin' && !auth.isAuthenticated && pathname === '/') {
    return <GoogleButtons key="googleLogin" type="login" index={index} dispatch={dispatch} />;
  }
  if (menu.type === 'googleLogout' && auth.isAuthenticated) {
    return <GoogleButtons key="googleLogout" type="logout" index={index} dispatch={dispatch} />;
  }
  return null;
};

export function IconAndText({ menu }: { menu: ImenuItem }): JSX.Element {
  return (
    <div style={{ display: 'inline' }}>
      <i className={`${menu.iconClass}`} />
    &nbsp;
      <span className="nav-item">{menu.name}</span>
    </div>
  );
}

interface ImakeLinkProps { menu: ImenuItem, index: number, type: string, handleClose: () => void }
export function MakeLink(props: ImakeLinkProps): JSX.Element {
  const {
    menu, index, type, handleClose,
  } = props;
  return (
    <div key={index} className="menu-item">
      {type === 'Link' ? (
        <Link to={menu.link} className="nav-link" onClick={handleClose}>
          <IconAndText menu={menu} />
        </Link>
      )
        : (
          <a href={menu.link} className="nav-link" onClick={handleClose}>
            <IconAndText menu={menu} />
          </a>
        )}
    </div>
  );
}

interface IsideMenuItemProps {
  menu: ImenuItem, index: number, auth: Auth, location: RouteComponentProps['location'],
  dispatch: Dispatch<unknown>, handleClose: () => void,
}
export function SideMenuItem(props: IsideMenuItemProps): JSX.Element | null {
  const {
    menu, index, auth, location, dispatch, handleClose,
  } = props;
  const userRoles: string[] = commonUtils.getUserRoles();
  if (menu.auth && (!auth.isAuthenticated || userRoles.indexOf(auth.user.userType) === -1)) return null;
  if (location.pathname.includes('/music') && (menu.link.includes('/music') || menu.name === 'Web Jam LLC')) {
    return <MakeLink menu={menu} index={index} type="Link" handleClose={handleClose} />;
  }
  if (menu.type === 'link' && !menu.link.includes('/music/') && !location.pathname.includes('/music')) {
    return <MakeLink menu={menu} index={index} type="Link" handleClose={handleClose} />;
  }
  return continueMenuItem(menu, index, auth, location.pathname, dispatch);
}

