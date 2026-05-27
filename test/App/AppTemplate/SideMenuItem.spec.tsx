/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import type { ImenuItem } from 'src/App/AppTemplate/menuConfig';
import { checkIsAllowed, ContinueMenuItem, SideMenuItem } from 'src/App/AppTemplate/SideMenuItem';
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
      menu: { auth: false, link: '/music', name: 'Music' } as ImenuItem,
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
    const menu: any = { auth: true };
    const auth: any = { isAuthenticated: true, user: { userType: 'tester' } };
    const userRoles = ['admin'];
    const isAllowed = checkIsAllowed(menu, auth, userRoles);
    expect(isAllowed).toBe(false);
  });
});
