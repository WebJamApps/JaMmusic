/* eslint-disable @typescript-eslint/no-explicit-any */
import { continueMenuItem, MenuItem } from '../../src/App/AppTemplate/MenuItem';
import renderer from 'react-test-renderer';
import commonUtils from 'src/lib/commonUtils';
import type { ImenuItem } from 'src/App/AppTemplate/menuConfig';
import { BrowserRouter } from 'react-router-dom';
import type { Auth } from 'src/redux/mapStoreToProps';
import type { AppTemplateProps } from 'src/App/AppTemplate';

describe('MenuItem', () => {
  const vStub: any = {
    googleButtons: () => true,
    makeMenuLink: () => true,
    props: {
      location: { pathname: '/music' },
      auth: { token: 'token', isAuthenticated: true, user: { userType: '' } },
      dispatch: () => jest.fn(),
    },
  };
  it('renders MenuItem when location.pathname is music', () => {
    commonUtils.getUserRoles = jest.fn(()=>['']);
    const props = {
      menu: { auth: true, link: '/music' } as ImenuItem, index: 1, view: vStub,
    };
    const menuItem:any = renderer.create(<BrowserRouter><MenuItem {...props} /></BrowserRouter>).toJSON();
    expect(menuItem.type).toBe('div');
  });
  it('renders MenuItem when location.pathname is music for Web Jam LLC', () => {
    commonUtils.getUserRoles = jest.fn(()=>['']);
    const props = {
      menu: { auth: true, link: '/test', name:'Web Jam LLC' } as ImenuItem, index: 1, view: vStub,
    };
    const menuItem:any = renderer.create(<BrowserRouter><MenuItem {...props} /></BrowserRouter>).toJSON();
    expect(menuItem.type).toBe('div');
  });
  it('renders MenuItem when location.pathname is not music', () => {
    commonUtils.getUserRoles = jest.fn(()=>['']);
    vStub.props.location.pathname = 'test';
    const props = {
      menu: { auth: true, link: '/test', type:'link' } as ImenuItem, index: 1, view: vStub,
    };
    const menuItem:any = renderer.create(<BrowserRouter><MenuItem {...props} /></BrowserRouter>).toJSON();
    expect(menuItem.type).toBe('div');
  });
  it('renders MenuItem when googleLogout', () => {
    commonUtils.getUserRoles = jest.fn(()=>['']);
    vStub.props.location.pathname = 'test';
    const props = {
      menu: { auth: true, link: '/test', type:'googleLogout' } as ImenuItem, index: 1, view: vStub,
    };
    const menuItem:any = renderer.create(<BrowserRouter><MenuItem {...props} /></BrowserRouter>).toJSON();
    expect(menuItem.type).toBe('div');
  });
  it('returns null', ()=>{
    commonUtils.getUserRoles = jest.fn(()=>['test']);
    vStub.props.location.pathname = 'test';
    const props = {
      menu: { auth: true, link: '/test', type:'googleLogout' } as ImenuItem, index: 1, view: vStub,
    };
    const menuItem:any = renderer.create(<BrowserRouter><MenuItem {...props} /></BrowserRouter>).toJSON();
    expect(menuItem).toBeNull();
  });
  it('continueMenuItem returns googleLogin', ()=>{
    const cMenuItem:any = continueMenuItem(
      { type:'googleLogin' } as ImenuItem, 1, { isAuthenticated:false } as Auth, {} as AppTemplateProps);
    const result:any = renderer.create(cMenuItem).toJSON();
    expect(result.type).toBe('div');
  });
  it('continueMenuItem returns null', ()=>{
    const cMenuItem:any = continueMenuItem(
      { type:'' } as ImenuItem, 1, { isAuthenticated:false } as Auth, {} as AppTemplateProps);
    const result:any = renderer.create(cMenuItem).toJSON();
    expect(result).toBeNull();
  });
});
