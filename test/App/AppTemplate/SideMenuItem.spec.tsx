/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrowserRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import type { ImenuItem } from 'src/App/AppTemplate/menuConfig';
import { checkIsAllowed, continueMenuItem, SideMenuItem } from 'src/App/AppTemplate/SideMenuItem';
import commonUtils from 'src/lib/commonUtils';

describe('SideMenuItem', () => {
  it('is defined', () => {
    expect(SideMenuItem).toBeDefined();
  });
  it('returns MakeLink for /music', () => {
    commonUtils.getUserRoles = jest.fn(() => ['tester']);
    const props = {
      index: 1,
      auth: { isAuthenticated: false, user: { userType: 'joker' } } as any,
      location: { pathname: '/music' },
      menu: { auth: false, link: '/music' } as ImenuItem,
      handleClose: jest.fn(),
    };
    const smi: any = renderer.create(<BrowserRouter><SideMenuItem {...props} /></BrowserRouter>).toJSON();
    expect(smi.props.className).toBe('menu-item');
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
  it('continueMenuItem returns googleLogout', () => {
    const result: any = continueMenuItem(
      { type: 'googleLogout' } as ImenuItem,
      1,
      { isAuthenticated: true } as any,
      '',
      jest.fn(),
    );
    expect(result.key).toBe('googleLogout');
  });
  it('checkIsAllowed return false if item requires auth and userType is not allowed', () => {
    const menu:any = { auth: true };
    const auth:any = { isAuthenticated: true, user: { userType: 'tester' } };
    const userRoles = ['admin'];
    const isAllowed = checkIsAllowed(menu, auth, userRoles);
    expect(isAllowed).toBe(false);
  });
});
