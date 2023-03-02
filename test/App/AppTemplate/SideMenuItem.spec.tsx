/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrowserRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import type { ImenuItem } from 'src/App/AppTemplate/menuConfig';
import { checkIsAllowed, ContinueMenuItem, SideMenuItem } from 'src/App/AppTemplate/SideMenuItem';
import commonUtils from 'src/lib/commonUtils';

describe('SideMenuItem', () => {
  it('is defined', () => {
    expect(SideMenuItem).toBeDefined();
  });
  it('renders MakeLink for /music', () => {
    commonUtils.getUserRoles = jest.fn(() => ['tester']);
    const props = {
      index: 1,
      auth: { isAuthenticated: false, user: { userType: 'joker' } } as any,
      menu: { auth: false, link: '/music' } as ImenuItem,
      handleClose: jest.fn(),
    };
    const smi = renderer.create(<BrowserRouter><SideMenuItem {...props} /></BrowserRouter>).root;
    expect(smi).toBeDefined();
  });
  it('returns MakeLink for /music when Web Jam LLC', () => {
    commonUtils.getUserRoles = jest.fn(() => ['tester']);
    const props = {
      index: 1,
      auth: { isAuthenticated: false, user: { userType: 'joker' } } as any,
      location: { pathname: '/music' },
      menu: { auth: false, link: '/', name: 'Web Jam LLC' } as ImenuItem,
      handleClose: jest.fn(),
    };
    const smi: any = renderer.create(<BrowserRouter><SideMenuItem {...props} /></BrowserRouter>);
    expect(smi.toJSON().props.className).toBe('menu-item');
    smi.root.findByProps({ type: 'Link' }).props.handleClose();
    expect(props.handleClose).toHaveBeenCalled();
  });
  it('ContinueMenuItem returns googleLogout', () => {
    const props = {
      menu: { type: 'googleLogout' } as ImenuItem,
      index: 1,
      auth: { isAuthenticated: true } as any,
      pathname: '',
      handleClose: jest.fn(),
    };
    const result: any = renderer.create(<ContinueMenuItem {...props} />).toJSON();
    expect(result.props.className.includes('googleLogout')).toBe(true);
  });
  it('ContinueMenuItem when music', () => {
    const props = {
      menu: { type: 'link', link: '/music' } as ImenuItem,
      index: 1,
      auth: { isAuthenticated: true } as any,
      pathname: '/music',
      handleClose: jest.fn(),
    };
    const result: any = renderer.create(<BrowserRouter><ContinueMenuItem {...props} /></BrowserRouter>).toJSON();
    expect(result.children[0].props.href).toBe('/music');
  });
  it('checkIsAllowed return false if item requires auth and userType is not allowed', () => {
    const menu: any = { auth: true };
    const auth: any = { isAuthenticated: true, user: { userType: 'tester' } };
    const userRoles = ['admin'];
    const isAllowed = checkIsAllowed(menu, auth, userRoles);
    expect(isAllowed).toBe(false);
  });
});
