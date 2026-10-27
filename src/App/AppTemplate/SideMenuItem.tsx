
import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { AuthContext, Iauth } from 'src/providers/Auth.provider';
import commonUtils from '../../lib/utils';
import type { ImenuItem } from './menuConfig';
import { GoogleButtons } from './GoogleButtons';
import { ThemeToggle } from './ThemeToggle';

export const stripTrailingSlash = (path: string): string => {
  if (path === '/' || !path.endsWith('/')) return path;
  return path.replace(/\/$/, '');
};

export const isCurrentPage = (currentPath: string, link: string): boolean => {
  if (!link) return false;
  return stripTrailingSlash(currentPath) === stripTrailingSlash(link);
};

export function IconAndText({ menu }: { menu: ImenuItem }) {
  const iconClass = menu.iconClass ? `${menu.iconClass} fa-fw` : '';
  return (
    <div className="nav-link-content">
      {iconClass && <i className={iconClass} />}
      <span className="nav-item">{menu.name}</span>
    </div>
  );
}

interface ImakeLinkProps {
  menu: ImenuItem, index: number, type: string, handleClose: () => void, isSubItem?: boolean,
}
export function MakeLink(props: ImakeLinkProps) {
  const {
    menu, index, type, handleClose, isSubItem,
  } = props;
  let onClick = handleClose;
  if (menu.link === '/') { onClick = () => { handleClose(); window.location.assign('/'); }; }
  const itemClassName = `menu-item${isSubItem ? ' menu-sub-item' : ''}`;
  return (
    <div key={index} className={itemClassName}>
      {type === 'Link' ? (
        <Link to={menu.link} className="nav-link" onClick={onClick}>
          <IconAndText menu={menu} />
        </Link>
      )
        : (
          <a href={menu.link} className="nav-link" onClick={onClick}>
            <IconAndText menu={menu} />
          </a>
        )}
    </div>
  );
}

interface IcontinueMenuItemProps {
  menu: ImenuItem,
  index: number,
  auth: Iauth,
  pathname: string,
  handleClose: () => void,
  isSubItem?: boolean,
}
export const ContinueMenuItem = (props: IcontinueMenuItemProps): React.JSX.Element | null => {
  const {
    menu, index, auth, pathname, handleClose, isSubItem,
  } = props;
  const link = menu.link || '';
  const isMusicPath = pathname.includes('/music') || pathname.includes('/setlist');
  if (isSubItem) {
    return <MakeLink menu={menu} index={index} type="Link" handleClose={handleClose} isSubItem={isSubItem} />;
  }
  if (isMusicPath && link.includes('/music')) {
    return <MakeLink menu={menu} index={index} type="Link" handleClose={handleClose} isSubItem={isSubItem} />;
  }
  if (menu.type === 'link' && !link.includes('/music/') && !isMusicPath) {
    return <MakeLink menu={menu} index={index} type="Link" handleClose={handleClose} isSubItem={isSubItem} />;
  }
  if (menu.type === 'googleLogin' && !auth.isAuthenticated && pathname === '/') {
    return <GoogleButtons key="googleLogin" type="login" index={index} />;
  }
  if (menu.type === 'googleLogout' && auth.isAuthenticated) {
    return <GoogleButtons key="googleLogout" type="logout" index={index} />;
  }
  if (menu.type === 'themeToggle') {
    return <ThemeToggle key={`themeToggle-${index}`} />;
  }
  return null;
};

export const checkIsAllowed = (menu: ImenuItem, auth: Iauth, userRoles: string[]) => {
  if (menu.auth && (!auth.isAuthenticated || userRoles.indexOf(auth.user.userType) === -1)) return false;
  if (menu.roles && (!auth.isAuthenticated || !menu.roles.includes(auth.user.userType))) return false;
  return true;
};

interface IsideMenuItemProps {
  menu: ImenuItem, index: number,
  handleClose: () => void,
  isSubItem?: boolean,
  menuOpen?: boolean,
}
export function SideMenuItem(props: IsideMenuItemProps): React.JSX.Element | null {
  const {
    menu, index, handleClose, isSubItem, menuOpen,
  } = props;
  const { auth } = useContext(AuthContext);
  const location = useLocation() || { pathname: '' };
  const pathname = location.pathname || '';
  const userRoles: string[] = commonUtils.getUserRoles();
  const isAllowed = checkIsAllowed(menu, auth, userRoles);

  const containsCurrentPage = Boolean(
    menu.children?.some((child) => isCurrentPage(pathname, child.link)),
  );
  const [isOpen, setIsOpen] = useState(containsCurrentPage);

  useEffect(() => {
    if (containsCurrentPage) {
      setIsOpen(true);
    }
  }, [containsCurrentPage, pathname, menuOpen]);

  if (!isAllowed) return null;

  if (menu.type === 'group' && menu.children) {
    const listId = `menu-group-${menu.className || index}`;
    return (
      <div key={index} className="menu-group-container">
        <div className="menu-item menu-group-header">
          <button
            type="button"
            className="menu-group-button"
            aria-label={menu.name}
            aria-expanded={isOpen}
            aria-controls={listId}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((prev) => !prev);
            }}
          >
            <span className="menu-group-title">
              <i className={menu.iconClass ? `${menu.iconClass} fa-fw` : ''} aria-hidden="true" />
              &nbsp;&nbsp;
              <span className="group-name">{menu.name}</span>
            </span>
            <i
              className={`fas fa-chevron-${isOpen ? 'down' : 'right'} group-arrow`}
              aria-hidden="true"
            />
          </button>
        </div>
        <div
          id={listId}
          className="group-items"
          hidden={!isOpen}
          style={{ display: isOpen ? 'block' : 'none' }}
        >
          {isOpen && menu.children.map((child, childIndex) => (
            <SideMenuItem
              key={child.name || childIndex}
              menu={child}
              index={childIndex}
              handleClose={handleClose}
              isSubItem
              menuOpen={menuOpen}
            />
          ))}
        </div>
      </div>
    );
  }

  if (menu.name === 'Web Jam LLC' || menu.nav === 'jam') {
    return (
      <MakeLink
        menu={menu}
        index={index}
        type="Link"
        handleClose={handleClose}
        isSubItem={isSubItem}
      />
    );
  }
  const cmiProps = {
    menu, index, auth, pathname, handleClose, isSubItem,
  };
  return <ContinueMenuItem {...cmiProps} />;
}
