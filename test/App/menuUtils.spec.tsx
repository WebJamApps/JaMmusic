/* eslint-disable @typescript-eslint/no-explicit-any */
import { MenuItem } from '../../src/App/AppTemplate/MenuItem';

describe('MenuItem', () => {
  const vStub:any = {
    googleButtons: () => true,
    makeMenuLink: () => true,
    props: {
      location: { pathname: '/music' },
      auth: { token: 'token', isAuthenticated: true, user: { userType: '' } },
      dispatch: () => jest.fn(),
    },
  };
  it('is true', ()=>{
    expect(true).toBe(true);
  });
  // it('handles menuItem for GoogleLogout', () => {
  //   const menuItem:any = { link: '/', type: 'googleLogout', auth: true };
  //   const auth:any = { isAuthenticated: true };
  //   const result = menuUtils.continueMenuItem(menuItem,
  //     1, auth, vStub);
  //   expect(result).toBe(true);
  // });
  // it('returns null if auth role is not a match', () => {
  //   const menu: any = { auth: true };
  //   const result = <MenuItem menu={menu} index={1} view={vStub}/>;
  //   expect(result).toBe(null);
  // });
  // it('handles menuItem for music/songs', () => {
  //   const menu: any = { auth: false, link: '/music/songs' };
  //   const result = <MenuItem menu={menu} index={1} view={vStub}/>;
  //   expect(result).toBe(true);
  // });
  // it('handles menuItem for Web Jam LLC', () => {
  //   const menu: any = { auth: false, link: '/', name: 'Web Jam LLC' };
  //   const result = <MenuItem menu={menu} index={1} view={vStub}/>;
  //   expect(result).toBe(true);
  // });
});
