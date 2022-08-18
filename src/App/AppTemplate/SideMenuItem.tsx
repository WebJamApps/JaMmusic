
import type { Auth } from '../../redux/mapStoreToProps';
import commonUtils from '../../lib/commonUtils';
import type { ImenuItem } from './menuConfig';
import { GoogleButtons } from './GoogleButtons';
import { Link } from 'react-router-dom';
import type { Dispatch } from 'react';

export const continueMenuItem = (
  menu: ImenuItem,
  index: number,
  auth: Auth,
  pathname: string,
  dispatch:Dispatch<unknown>,
): JSX.Element | null => {
  if (menu.type === 'googleLogin' && !auth.isAuthenticated && pathname === '/') {
    return <GoogleButtons key="googleLogin" type="login" index={index} dispatch={dispatch} />;
  }
  if (menu.type === 'googleLogout' && auth.isAuthenticated) {
    return <GoogleButtons key="googleLogout" type="logout" index={index} dispatch={dispatch}/>;
  }
  return null;
};

export const IconAndText = ({ menu }: { menu: ImenuItem }): JSX.Element => (
  <div style={{ display: 'inline' }}>
    <i className={`${menu.iconClass}`} />
    &nbsp;
    <span className="nav-item">{menu.name}</span>
  </div>
);

interface ImakeLinkProps {menu: ImenuItem, index: number, type: string, setState:(arg0:any)=>void}
export const MakeLink = (props:ImakeLinkProps): JSX.Element => {
  const { menu, index, type, setState } = props;
  return (
    <div key={index} className="menu-item">
      {type === 'Link' ? (
        <Link to={menu.link} className="nav-link" onClick={()=>setState({ menuOpen: false })}>
          <IconAndText menu={menu} />
        </Link>
      )
        : (
          <a href={menu.link} className="nav-link" onClick={()=>setState({ menuOpen: false })}>
            <IconAndText menu={menu} />
          </a>
        )}
    </div>
  );
};

interface IsideMenuItemProps { 
  menu: ImenuItem, index: number, auth:any, location:any, setState:(arg0:any)=>void, dispatch:Dispatch<unknown>
}
export const SideMenuItem = (props: IsideMenuItemProps): JSX.Element | null => {
  const { menu, index, auth, location, setState, dispatch } = props;
  const userRoles: string[] = commonUtils.getUserRoles();
  // const { location, auth } = view.props;
  if (menu.auth && (!auth.isAuthenticated || userRoles.indexOf(auth.user.userType) === -1)) return null;
  if (location.pathname.includes('/music') && (menu.link.includes('/music') || menu.name === 'Web Jam LLC')) {
    return <MakeLink menu={menu} index={index} type='Link' setState={setState}/>;
  }
  if (menu.type === 'link' && !menu.link.includes('/music/') && !location.pathname.includes('/music')) {
    return <MakeLink menu={menu} index={index} type='Link' setState={setState}/>;
  }
  return continueMenuItem(menu, index, auth, location.pathname, dispatch);
};

