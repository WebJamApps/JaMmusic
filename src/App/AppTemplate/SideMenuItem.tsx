
import { Link, RouteComponentProps } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext, Iauth } from 'src/providers/Auth.provider';
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
  handleClose: () => void,
): JSX.Element | null => {
  if (pathname.includes('/music') && (menu.link.includes('/music'))) {
    return <MakeLink menu={menu} index={index} type="Link" handleClose={handleClose} />;
  }
  if (menu.type === 'link' && !menu.link.includes('/music/') && !pathname.includes('/music')) {
    return <MakeLink menu={menu} index={index} type="Link" handleClose={handleClose} />;
  }
  if (menu.type === 'googleLogin' && !auth.isAuthenticated && pathname === '/') {
    return <GoogleButtons key="googleLogin" type="login" index={index} />;
  }
  if (menu.type === 'googleLogout' && auth.isAuthenticated) {
    return <GoogleButtons key="googleLogout" type="logout" index={index} />;
  }
  return null;
};

export const checkIsAllowed = (menu: ImenuItem, auth: Iauth, userRoles: string[]) => {
  if (menu.auth && (!auth.isAuthenticated || userRoles.indexOf(auth.user.userType) === -1)) return false;
  return true;
};

interface IsideMenuItemProps {
  menu: ImenuItem, index: number, location: RouteComponentProps['location'],
  handleClose: () => void,
}
export function SideMenuItem(props: IsideMenuItemProps): JSX.Element | null {
  const {
    menu, index, location, handleClose,
  } = props;
  const { auth } = useContext(AuthContext);
  const userRoles: string[] = commonUtils.getUserRoles();
  const isAllowed = checkIsAllowed(menu, auth, userRoles);
  if (!isAllowed) return null;
  if (menu.name === 'Web Jam LLC') {
    return (
      <MakeLink
        menu={menu}
        index={index}
        type="Link"
        handleClose={() => {
          // window.location.assign('/');
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
          // localStorage.clear(); sessionStorage.clear(); return 'cleared';
        }}
      />
    );
  }
  return continueMenuItem(menu, index, auth, location.pathname, handleClose);
}

