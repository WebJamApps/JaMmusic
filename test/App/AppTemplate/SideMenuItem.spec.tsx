/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrowserRouter, RouteComponentProps } from 'react-router-dom';
import renderer from 'react-test-renderer';
import type { ImenuItem } from 'src/App/AppTemplate/menuConfig';
import { continueMenuItem, SideMenuItem } from 'src/App/AppTemplate/SideMenuItem';
import commonUtils from 'src/lib/commonUtils';
import type { Auth } from 'src/redux/mapStoreToProps';

describe('SideMenuItem', () => {
  it('is defined', () => {
    expect(SideMenuItem).toBeDefined();
  });
  it('returns null for auth item when user is incorrect type', () => {
    commonUtils.getUserRoles = jest.fn(() => ['tester']);
    const props = {
      index: 1,
      auth: { isAuthenticated: true, user: { userType: 'joker' } } as Auth,
      location: { pathname: '/music' } as RouteComponentProps['location'],
      menu: { auth: true, link: '/dashboard' } as ImenuItem,
      dispatch: jest.fn(),
      handleClose: jest.fn(),
    };
    const smi = renderer.create(<SideMenuItem {...props} />).toJSON();
    expect(smi).toBeNull();
  });
  it('returns MakeLink for /music', () => {
    commonUtils.getUserRoles = jest.fn(() => ['tester']);
    const props = {
      index: 1,
      auth: { isAuthenticated: false, user: { userType: 'joker' } } as Auth,
      location: { pathname: '/music' } as RouteComponentProps['location'],
      menu: { auth: false, link: '/music' } as ImenuItem,
      dispatch: jest.fn(),
      handleClose: jest.fn(),
    };
    const smi: any = renderer.create(<BrowserRouter><SideMenuItem {...props} /></BrowserRouter>).toJSON();
    expect(smi.props.className).toBe('menu-item');
  });
  it('returns MakeLink for /music when Web Jam LLC', () => {
    commonUtils.getUserRoles = jest.fn(() => ['tester']);
    const props = {
      index: 1,
      auth: { isAuthenticated: false, user: { userType: 'joker' } } as Auth,
      location: { pathname: '/music' } as RouteComponentProps['location'],
      menu: { auth: false, link: '/', name: 'Web Jam LLC' } as ImenuItem,
      dispatch: jest.fn(),
      handleClose: jest.fn(),
    };
    const smi: any = renderer.create(<BrowserRouter><SideMenuItem {...props} /></BrowserRouter>).toJSON();
    expect(smi.props.className).toBe('menu-item');
  });
  it('continueMenuItem returns googleLogout', () => {
    const result: any = continueMenuItem({ type: 'googleLogout' } as ImenuItem, 1, { isAuthenticated: true } as Auth, '', jest.fn(), jest.fn());
    expect(result.key).toBe('googleLogout');
  });
  it('clears storage when clicking on menu items from joshandmariamusic', () => {
    localStorage.clear = jest.fn();
    sessionStorage.clear = jest.fn();
    const props = {
      index: 1,
      auth: { isAuthenticated: false, user: { userType: 'joker' } } as Auth,
      location: { pathname: '/' } as RouteComponentProps['location'],
      menu: {
        nav: 'jam', auth: false, link: '/songs', name: 'Songs',
      } as ImenuItem,
      dispatch: jest.fn(),
      handleClose: jest.fn(),
    };
    const smi: any = renderer.create(<BrowserRouter><SideMenuItem {...props} /></BrowserRouter>).root;
    const result = smi.findByProps({ type: 'Link' }).props.handleClose();
    expect(result).toBe('cleared');
  });
});
