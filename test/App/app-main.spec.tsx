import React from 'react';
import { shallow } from 'enzyme';
import { AppTemplate } from '../../src/App/app-main';
import authUtils from '../../src/App/authUtils';

const dFunc = () => {};
function setup() {
  const props = { children: '<div></div>' };
  document.body.innerHTML = '<div class="page-content"></div>';
  const wrapper = shallow<AppTemplate>(<AppTemplate dispatch={dFunc} location={{ pathname: '/' }}><div /></AppTemplate>);
  return { wrapper, props };
}

describe('app-main component test setup', () => {
  it('renders the component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('div.page-host').exists()).toBe(true);
  });
  it('rerenders the component when menuOpen state changes', () => {
    const { wrapper } = setup();
    wrapper.setState({ menuOpen: true });
    expect(wrapper.find('div.open').length).toBe(1);
  });
  it('handles response from google login', async () => {
    authUtils.responseGoogleLogin = jest.fn(() => Promise.resolve(true));
    const wrapper2 = shallow<AppTemplate>(<AppTemplate dispatch={dFunc} location={{ pathname: '/music' }}><div /></AppTemplate>);
    const result = await wrapper2.instance().responseGoogleLogin({});
    expect(result).toBe(true);
  });
  it('handles response from google logout', async () => {
    authUtils.responseGoogleLogout = jest.fn(() => Promise.resolve(true));
    const wrapper2 = shallow<AppTemplate>(<AppTemplate dispatch={dFunc} location={{ pathname: '/music' }}><div /></AppTemplate>);
    const result = await wrapper2.instance().responseGoogleLogout();
    expect(result).toBe(true);
  });
  it('renders the logout button', () => new Promise((done) => {
    const { wrapper } = setup();
    const logoutButton = wrapper.instance().googleButtons('logout', 5);
    const rLogout = shallow(logoutButton);
    expect(rLogout.find('div.googleLogout').length).toBe(1);
    done();
  }));
  it('closes the menu without navigating away from the react app', () => {
    document.body.innerHTML = '<button class="googleLogin"/><button class="googleLogout"/>';
    const aT = new AppTemplate({ dispatch: () => Promise.resolve(true) });
    aT.setState = () => {};
    const result = aT.close();
    expect(result).toBe(true);
  });
  it('closes the mobile menu on clicking escape key', () => new Promise((done) => {
    const aT = new AppTemplate({ dispatch: () => Promise.resolve(true) });
    aT.setState = jest.fn(() => true);
    const result = aT.handleKeyPress({ key: 'Escape' });
    expect(result).toBe(true);
    done();
  }));
  it('does not closes the mobile menu on clicking Enter key', () => new Promise((done) => {
    const aT = new AppTemplate({ dispatch: () => Promise.resolve(true) });
    const result = aT.handleKeyPress({ key: 'Enter' });
    expect(result).toBe(null);
    done();
  }));
  it('toggles the mobile menu on clicking Enter key', () => new Promise((done) => {
    const aT = new AppTemplate({ dispatch: () => Promise.resolve(true) });
    aT.toggleMobileMenu = () => true;
    const result = aT.handleKeyMenu({ key: 'Enter' });
    expect(result).toBe(true);
    done();
  }));
  it('does not toggle the mobile menu on clicking Escape key', () => new Promise((done) => {
    const aT = new AppTemplate({ dispatch: () => Promise.resolve(true) });
    aT.toggleMobileMenu = () => true;
    const result = aT.handleKeyMenu({ key: 'Escape' });
    expect(result).toBe(null);
    done();
  }));
  it('toggles the mobile menu', () => {
    const { wrapper } = setup();
    wrapper.instance().setState = jest.fn();
    wrapper.instance().toggleMobileMenu();
    expect(wrapper.instance().setState).toHaveBeenCalledWith({ menuOpen: true });
  });
});
