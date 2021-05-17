/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { shallow } from 'enzyme';
import { GoogleLogin } from 'react-google-login';
import { AppTemplate } from '../../src/App/AppTemplate';
import authUtils from '../../src/App/authUtils';

const anyProp: any = {};
const location: any = { pathname: '/' };
const dFunc = () => { };
function setup() {
  const props = { children: '<div></div>' };
  document.body.innerHTML = '<div class="page-content"></div>';
  const wrapper = shallow<AppTemplate>(
    <AppTemplate
      dispatch={dFunc}
      location={location}
      history={anyProp}
      match={anyProp}
    />,
  );
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
    authUtils.responseGoogleLogin = jest.fn(() => Promise.resolve('true'));
    const wrapper2 = shallow<AppTemplate>(
      <AppTemplate
        dispatch={dFunc}
        location={location}
        history={anyProp}
        match={anyProp}
      />,
    );
    const gRes: any = {};
    const result = await wrapper2.instance().responseGoogleLogin(gRes);
    expect(result).toBe('true');
  });
  it('handles response from google logout', async () => {
    authUtils.responseGoogleLogout = jest.fn(() => true);
    const wrapper2 = shallow<AppTemplate>(<AppTemplate
      dispatch={dFunc}
      location={location}
      history={anyProp}
      match={anyProp}
    />);
    const result = await wrapper2.instance().responseGoogleLogout();
    expect(result).toBe(true);
  });
  it('renders the logout button', () => {
    const { wrapper } = setup();
    const logoutButton = wrapper.instance().googleButtons('logout', 5);
    const rLogout = shallow(logoutButton);
    expect(rLogout.find('div.googleLogout').length).toBe(1);
  });
  it('closes the menu without navigating away from the react app', () => {
    document.body.innerHTML = '<button class="googleLogin"/><button class="googleLogout"/>';
    const aProps: any = { dispatch: () => Promise.resolve(true) };
    const aT = new AppTemplate(aProps);
    aT.setState = () => { };
    const result = aT.close();
    expect(result).toBe(true);
  });
  it('closes the mobile menu on clicking escape key', () => {
    const aProps: any = { dispatch: () => Promise.resolve(true) };
    const aT = new AppTemplate(aProps);
    aT.setState = jest.fn(() => true);
    const result = aT.handleKeyPress({ key: 'Escape' });
    expect(result).toBe(true);
  });
  it('does not closes the mobile menu on clicking Enter key', () => {
    const aProps: any = { dispatch: () => Promise.resolve(true) };
    const aT = new AppTemplate(aProps);
    const result = aT.handleKeyPress({ key: 'Enter' });
    expect(result).toBe(null);
  });
  it('toggles the mobile menu on clicking Enter key', () => {
    const aProps: any = { dispatch: () => Promise.resolve(true) };
    const aT = new AppTemplate(aProps);
    aT.toggleMobileMenu = () => true;
    const result = aT.handleKeyMenu({ key: 'Enter' });
    expect(result).toBe(true);
  });
  it('does not toggle the mobile menu on clicking Escape key', () => {
    const aProps: any = { dispatch: () => Promise.resolve(true) };
    const aT = new AppTemplate(aProps);
    aT.toggleMobileMenu = () => true;
    const result = aT.handleKeyMenu({ key: 'Escape' });
    expect(result).toBe(null);
  });
  it('toggles the mobile menu', () => {
    const { wrapper } = setup();
    wrapper.instance().setState = jest.fn();
    wrapper.instance().toggleMobileMenu();
    expect(wrapper.instance().setState).toHaveBeenCalledWith({ menuOpen: true });
  });
  it('runs onAutoLoadFinished props from GoogleLogin component', () => {
    const wrapper2 = shallow<AppTemplate>(<AppTemplate
      dispatch={dFunc}
      location={location}
      history={anyProp}
      match={anyProp}
    />);
    const bu = wrapper2.instance().googleButtons('login', 1);
    const gb = shallow(bu);
    const auto = gb.find(GoogleLogin).get(0).props.onAutoLoadFinished(false);
    expect(auto).toBe(false);
  });
  it('runs make external link when joshandmariamusic.com', () => {
    process.env.APP_NAME = 'joshandmariamusic.com';
    const { wrapper } = setup();
    wrapper.instance().navLinks();
    expect(wrapper.find('a').exists()).toBe(true);
  });
});
