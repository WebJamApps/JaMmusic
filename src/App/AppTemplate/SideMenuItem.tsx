
import { Link, RouteComponentProps } from 'react-router-dom';
import type { Dispatch } from 'react';
import type { Iauth } from 'src/providers/Auth.provider';
import commonUtils from '../../lib/commonUtils';
import type { ImenuItem } from './menuConfig';
import { GoogleButtons } from './GoogleButtons';

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

export const continueMenuItem = (
  menu: ImenuItem,
  index: number,
  auth: Iauth,
  pathname: string,
  dispatch: Dispatch<unknown>,
  handleClose: () => void,
): JSX.Element | null => {
  if (pathname.includes('/music') && (menu.link.includes('/music'))) {
    return <MakeLink menu={menu} index={index} type="Link" handleClose={handleClose} />;
  }
  if (menu.type === 'link' && !menu.link.includes('/music/') && !pathname.includes('/music')) {
    return <MakeLink menu={menu} index={index} type="Link" handleClose={handleClose} />;
  }
  if (menu.type === 'googleLogin' && !auth.isAuthenticated && pathname === '/') {
    return <GoogleButtons key="googleLogin" type="login" index={index} dispatch={dispatch} />;
  }
  if (menu.type === 'googleLogout' && auth.isAuthenticated) {
    return <GoogleButtons key="googleLogout" type="logout" index={index} dispatch={dispatch} />;
  }
  return null;
};

interface IsideMenuItemProps {
  menu: ImenuItem, index: number, auth: Iauth, location: RouteComponentProps['location'],
  dispatch: Dispatch<unknown>, handleClose: () => void,
}
export function SideMenuItem(props: IsideMenuItemProps): JSX.Element | null {
  const {
    menu, index, auth, location, dispatch, handleClose,
  } = props;
  const userRoles: string[] = commonUtils.getUserRoles();
  if (menu.auth && (!auth.isAuthenticated || userRoles.indexOf(auth.user.userType) === -1)) return null;
  if (menu.name === 'Web Jam LLC') {
    return (
      <MakeLink
        menu={menu}
        index={index}
        type="Link"
        handleClose={() => {
          window.location.assign('/');
        }}
      />
    );
  }
  if (menu.nav === 'jam') {
    return (
      <MakeLink
        menu={menu}
        index={index}
        type="Link"
        handleClose={() => {
          localStorage.clear(); sessionStorage.clear(); return 'cleared';
        }}
      />
    );
  }
  return continueMenuItem(menu, index, auth, location.pathname, dispatch, handleClose);
}

