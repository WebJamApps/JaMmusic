/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, MemoryRouter } from 'react-router';
import type { ImenuItem } from 'src/App/AppTemplate/menuConfig';
import {
  checkIsAllowed, ContinueMenuItem, SideMenuItem, isCurrentPage, stripTrailingSlash,
} from 'src/App/AppTemplate/SideMenuItem';
import { AuthContext, defaultAuth, type Iauth } from 'src/providers/Auth.provider';
import commonUtils from 'src/lib/utils';

describe('SideMenuItem', () => {
  it('is defined', () => {
    expect(SideMenuItem).toBeDefined();
  });
  it('renders MakeLink for /music', () => {
    commonUtils.getUserRoles = vi.fn(() => ['tester']);
    const props = {
      index: 1,
      auth: { isAuthenticated: false, user: { userType: 'joker' } } as any,
      location: { pathname: '/' },
      menu: { auth: false, link: '/music', name: 'Music', type: 'link' } as ImenuItem,
      handleClose: vi.fn(),
    };
    render(<BrowserRouter><SideMenuItem {...props} /></BrowserRouter>);
    expect(screen.getByRole('link', { name: /music/i })).toBeInTheDocument();
  });
  it('returns MakeLink for /music when Web Jam LLC', () => {
    commonUtils.getUserRoles = vi.fn(() => ['tester']);
    const props = {
      index: 1,
      auth: { isAuthenticated: false, user: { userType: 'joker' } } as any,
      location: { pathname: '/music' },
      menu: { auth: false, link: '/', name: 'Web Jam LLC' } as ImenuItem,
      handleClose: vi.fn(),
    };
    const { container } = render(<BrowserRouter><SideMenuItem {...props} /></BrowserRouter>);
    expect(container.firstChild).toHaveClass('menu-item');
    fireEvent.click(screen.getByRole('link'));
    expect(props.handleClose).toHaveBeenCalled();
  });
  it('ContinueMenuItem returns googleLogout', () => {
    const props = {
      menu: { type: 'googleLogout' } as ImenuItem,
      index: 1,
      auth: { isAuthenticated: true } as any,
      pathname: '',
      handleClose: vi.fn(),
    };
    const { container } = render(<ContinueMenuItem {...props} />);
    expect(container.firstChild).toHaveClass('googleLogout');
  });
  it('ContinueMenuItem when music', () => {
    const props = {
      menu: { type: 'link', link: '/music' } as ImenuItem,
      index: 1,
      auth: { isAuthenticated: true } as any,
      pathname: '/music',
      handleClose: vi.fn(),
    };
    render(<BrowserRouter><ContinueMenuItem {...props} /></BrowserRouter>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/music');
  });
  it('ContinueMenuItem returns ThemeToggle for themeToggle type', () => {
    const props = {
      menu: { type: 'themeToggle' } as ImenuItem,
      index: 1,
      auth: { isAuthenticated: false } as any,
      pathname: '/',
      handleClose: vi.fn(),
    };
    const { container } = render(<ContinueMenuItem {...props} />);
    expect(container.firstChild).toHaveClass('theme-toggle');
  });
  it('checkIsAllowed return false if item requires auth and userType is not allowed', () => {
    const menu: ImenuItem = {
      className: '',
      type: 'link',
      iconClass: '',
      link: '/admin',
      name: 'Admin',
      nav: 'admin',
      auth: true,
    };
    const auth: Iauth = {
      ...defaultAuth,
      isAuthenticated: true,
      user: { userType: 'tester', email: '' },
    };
    const userRoles = ['admin'];
    const isAllowed = checkIsAllowed(menu, auth, userRoles);
    expect(isAllowed).toBe(false);
  });
  it('checkIsAllowed returns false if item has roles and user is not authenticated', () => {
    const menu: ImenuItem = {
      className: '',
      type: 'link',
      iconClass: '',
      link: '/admin/database',
      name: 'Admin Database',
      nav: 'admin',
      roles: ['Developer'],
    };
    const auth: Iauth = {
      ...defaultAuth,
      isAuthenticated: false,
      user: { userType: '', email: '' },
    };
    const userRoles = ['Developer'];
    const isAllowed = checkIsAllowed(menu, auth, userRoles);
    expect(isAllowed).toBe(false);
  });
  it('checkIsAllowed returns false if item has roles and user userType is not in roles', () => {
    const menu: ImenuItem = {
      className: '',
      type: 'link',
      iconClass: '',
      link: '/admin/database',
      name: 'Admin Database',
      nav: 'admin',
      auth: true,
      roles: ['Developer'],
    };
    const auth: Iauth = {
      ...defaultAuth,
      isAuthenticated: true,
      user: { userType: 'JaM-admin', email: '' },
    };
    const userRoles = ['JaM-admin', 'Developer'];
    const isAllowed = checkIsAllowed(menu, auth, userRoles);
    expect(isAllowed).toBe(false);
  });
  it('checkIsAllowed returns true if item has roles and user userType is in roles', () => {
    const menu: ImenuItem = {
      className: '',
      type: 'link',
      iconClass: '',
      link: '/admin/database',
      name: 'Admin Database',
      nav: 'admin',
      auth: true,
      roles: ['Developer'],
    };
    const auth: Iauth = {
      ...defaultAuth,
      isAuthenticated: true,
      user: { userType: 'Developer', email: '' },
    };
    const userRoles = ['JaM-admin', 'Developer'];
    const isAllowed = checkIsAllowed(menu, auth, userRoles);
    expect(isAllowed).toBe(true);
  });

  describe('stripTrailingSlash and isCurrentPage', () => {
    it('stripTrailingSlash preserves root and non-trailing slash paths', () => {
      expect(stripTrailingSlash('/')).toBe('/');
      expect(stripTrailingSlash('/admin')).toBe('/admin');
      expect(stripTrailingSlash('/admin/users')).toBe('/admin/users');
      expect(stripTrailingSlash('/admin/users/')).toBe('/admin/users');
    });

    it('isCurrentPage evaluates page matching across trailing slashes', () => {
      expect(isCurrentPage('/admin/users', '')).toBe(false);
      expect(isCurrentPage('/admin/users', '/admin/users')).toBe(true);
      expect(isCurrentPage('/admin/users/', '/admin/users')).toBe(true);
      expect(isCurrentPage('/admin/users', '/admin/users/')).toBe(true);
      expect(isCurrentPage('/admin/users', '/admin/venues')).toBe(false);
    });
  });

  describe('Fold-open Admin group section', () => {
    const adminGroup: ImenuItem = {
      nav: 'wj',
      className: 'admin',
      type: 'group',
      iconClass: 'fas fa-user-secret',
      link: '',
      name: 'Admin',
      auth: true,
      children: [
        {
          nav: 'wj',
          className: 'users',
          type: 'link',
          iconClass: 'fas fa-users-cog',
          link: '/admin/users',
          name: 'Users',
          auth: true,
        },
        {
          nav: 'wj',
          className: 'venues',
          type: 'link',
          iconClass: 'fas fa-store',
          link: '/admin/venues',
          name: 'Venues',
          auth: true,
        },
        {
          nav: 'wj',
          className: 'database',
          type: 'link',
          iconClass: 'fas fa-database',
          link: '/admin/database',
          name: 'Database',
          auth: true,
          roles: ['Developer'],
        },
      ],
    };

    const developerAuth: Iauth = {
      ...defaultAuth,
      isAuthenticated: true,
      user: { userType: 'Developer', email: 'dev@example.com' },
    };

    const jamAdminAuth: Iauth = {
      ...defaultAuth,
      isAuthenticated: true,
      user: { userType: 'JaM-admin', email: 'admin@example.com' },
    };

    beforeEach(() => {
      commonUtils.getUserRoles = vi.fn(() => ['Developer', 'JaM-admin']);
    });

    it('renders a collapsed section and opens and closes on click', () => {
      const handleClose = vi.fn();
      render(
        <AuthContext.Provider value={{ auth: developerAuth, setAuth: vi.fn() }}>
          <MemoryRouter initialEntries={['/']}>
            <SideMenuItem menu={adminGroup} index={0} handleClose={handleClose} />
          </MemoryRouter>
        </AuthContext.Provider>,
      );

      const button = screen.getByRole('button', { name: 'Admin' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-controls', 'menu-group-admin');

      const controlledList = document.getElementById('menu-group-admin');
      expect(controlledList).toBeInTheDocument();
      expect(controlledList).toHaveAttribute('hidden');

      // Click to open
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(controlledList).not.toHaveAttribute('hidden');
      expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Venues' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Database' })).toBeInTheDocument();

      // Click to close
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(controlledList).toHaveAttribute('hidden');
    });

    it('opens by itself on an admin page', () => {
      const handleClose = vi.fn();
      render(
        <AuthContext.Provider value={{ auth: developerAuth, setAuth: vi.fn() }}>
          <MemoryRouter initialEntries={['/admin/users']}>
            <SideMenuItem menu={adminGroup} index={0} handleClose={handleClose} />
          </MemoryRouter>
        </AuthContext.Provider>,
      );

      const button = screen.getByRole('button', { name: 'Admin' });
      expect(button).toHaveAttribute('aria-expanded', 'true');
      const controlledList = document.getElementById('menu-group-admin');
      expect(controlledList).not.toHaveAttribute('hidden');
      expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument();
    });

    it('is hidden from accounts outside the role list (unauthenticated and unauthorized roles)', () => {
      const handleClose = vi.fn();

      // 1. Unauthenticated user
      const { queryByRole, rerender } = render(
        <AuthContext.Provider value={{ auth: defaultAuth, setAuth: vi.fn() }}>
          <MemoryRouter initialEntries={['/']}>
            <SideMenuItem menu={adminGroup} index={0} handleClose={handleClose} />
          </MemoryRouter>
        </AuthContext.Provider>,
      );
      expect(queryByRole('button', { name: 'Admin' })).not.toBeInTheDocument();

      // 2. Authenticated user with unauthorized role
      const unauthorizedAuth: Iauth = {
        ...defaultAuth,
        isAuthenticated: true,
        user: { userType: 'guest', email: 'guest@example.com' },
      };
      rerender(
        <AuthContext.Provider value={{ auth: unauthorizedAuth, setAuth: vi.fn() }}>
          <MemoryRouter initialEntries={['/']}>
            <SideMenuItem menu={adminGroup} index={0} handleClose={handleClose} />
          </MemoryRouter>
        </AuthContext.Provider>,
      );
      expect(queryByRole('button', { name: 'Admin' })).not.toBeInTheDocument();
    });

    it('shows Database only to Developer (hidden from JaM-admin)', () => {
      const handleClose = vi.fn();

      // Render as JaM-admin
      const { rerender } = render(
        <AuthContext.Provider value={{ auth: jamAdminAuth, setAuth: vi.fn() }}>
          <MemoryRouter initialEntries={['/admin/users']}>
            <SideMenuItem menu={adminGroup} index={0} handleClose={handleClose} />
          </MemoryRouter>
        </AuthContext.Provider>,
      );
      expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Venues' })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Database' })).not.toBeInTheDocument();

      // Rerender as Developer
      rerender(
        <AuthContext.Provider value={{ auth: developerAuth, setAuth: vi.fn() }}>
          <MemoryRouter initialEntries={['/admin/users']}>
            <SideMenuItem menu={adminGroup} index={0} handleClose={handleClose} />
          </MemoryRouter>
        </AuthContext.Provider>,
      );
      expect(screen.getByRole('link', { name: 'Database' })).toBeInTheDocument();
    });

    it('stops click propagation when clicking the section toggle button', () => {
      const parentClick = vi.fn();
      const handleClose = vi.fn();
      render(
        <AuthContext.Provider value={{ auth: developerAuth, setAuth: vi.fn() }}>
          <MemoryRouter initialEntries={['/']}>
            <div onClick={parentClick} role="presentation">
              <SideMenuItem menu={adminGroup} index={0} handleClose={handleClose} />
            </div>
          </MemoryRouter>
        </AuthContext.Provider>,
      );

      const button = screen.getByRole('button', { name: 'Admin' });
      fireEvent.click(button);
      expect(parentClick).not.toHaveBeenCalled();
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('calls handleClose when an admin sub-item link is clicked', () => {
      const handleClose = vi.fn();
      render(
        <AuthContext.Provider value={{ auth: developerAuth, setAuth: vi.fn() }}>
          <MemoryRouter initialEntries={['/']}>
            <SideMenuItem menu={adminGroup} index={0} handleClose={handleClose} />
          </MemoryRouter>
        </AuthContext.Provider>,
      );

      const button = screen.getByRole('button', { name: 'Admin' });
      fireEvent.click(button);

      const usersLink = screen.getByRole('link', { name: 'Users' });
      fireEvent.click(usersLink);
      expect(handleClose).toHaveBeenCalled();
    });
  });
});

