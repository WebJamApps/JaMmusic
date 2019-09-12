import React from 'react';
import { shallow } from 'enzyme';
import { AppTemplate } from '../../../src/App/app-main';

const dFunc = () => {};
function setup() {
  const props = { children: '<div></div>' };
  const wrapper = shallow(<AppTemplate dispatch={dFunc}><div /></AppTemplate>);
  return { wrapper, props };
}

describe('app-main component test setup', () => {
  it('renders the component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('div.page-host').exists()).toBe(true);
  });
  it('handles response from google login', async () => {
    document.body.innerHTML = '<button class="googleLogin"/><button class="googleLogout"/>';
    const aT = new AppTemplate({ dispatch: () => Promise.resolve(true) });
    const result = await aT.responseGoogleLogin({ code: 'somethingHere' });
    expect(result).toBe(true);
  });
  it('handles response from google logout', async () => {
    document.body.innerHTML = '<button class="googleLogin"/><button class="googleLogout"/>';
    const aT = new AppTemplate({ dispatch: () => Promise.resolve(true) });
    Object.defineProperty(window.location, 'reload', {
      configurable: true,
    });
    window.location.reload = jest.fn();
    await aT.responseGoogleLogout(true);
    expect(window.location.reload).toHaveBeenCalled();
  });
  it('closes the menu without navigating away from the react app', (done) => {
    document.body.innerHTML = '<button class="googleLogin"/><button class="googleLogout"/>';
    const aT = new AppTemplate({ dispatch: () => Promise.resolve(true) });
    aT.setState = () => {};
    const result = aT.close({ target: { classList: { contains() { return false; } } } });
    expect(result).toBe(true);
    done();
  });
  // it('closes the menu and navigates away from the react app', (done) => {
  //   document.body.innerHTML = '<button class="googleLogin"/><button class="googleLogout"/>';
  //   const aT = new AppTemplate({ dispatch: () => Promise.resolve(true) });
  //   aT.setState = () => {};
  //   aT.changeNav = () => true;
  //   const result = aT.close({ target: { classList: { contains() { return true; } } } });
  //   expect(result).toBe(true);
  //   done();
  // });
  it('closes the menu and logs in to google', (done) => {
    document.body.innerHTML = '<button class="googleLogin"/><button class="googleLogout"/>';
    const aT = new AppTemplate({ dispatch: () => Promise.resolve(true) });
    aT.setState = () => {};
    aT.changeNav = () => false;
    aT.loginGoogle = () => true;
    const result = aT.close({
      target: {
        classList: {
          contains(name) {
            if (name === 'loginGoogle') return true;
            return false;
          },
        },
      },
    });
    expect(result).toBe(true);
    done();
  });
  it('toggles the mobile menu', (done) => {
    const aT = new AppTemplate({ dispatch: () => Promise.resolve(true) });
    aT.state.menuOpen = false;
    aT.setState = (obj) => {
      expect(obj.menuOpen).toBe(true);
      done();
    };
    aT.toggleMobileMenu();
  });
  it('closes the mobile menu on clicking escape key', (done) => {
    const aT = new AppTemplate({ dispatch: () => Promise.resolve(true) });
    aT.setState = jest.fn(() => true);
    const result = aT.handleKeyPress({ key: 'Escape' });
    expect(result).toBe(true);
    done();
  });
  it('does not closes the mobile menu on clicking Enter key', (done) => {
    const aT = new AppTemplate({ dispatch: () => Promise.resolve(true) });
    const result = aT.handleKeyPress({ key: 'Enter' });
    expect(result).toBe(null);
    done();
  });
  it('toggles the mobile menu on clicking Enter key', (done) => {
    const aT = new AppTemplate({ dispatch: () => Promise.resolve(true) });
    aT.toggleMobileMenu = () => true;
    const result = aT.handleKeyMenu({ key: 'Enter' });
    expect(result).toBe(true);
    done();
  });
  it('does not toggle the mobile menu on clicking Escape key', (done) => {
    const aT = new AppTemplate({ dispatch: () => Promise.resolve(true) });
    aT.toggleMobileMenu = () => true;
    const result = aT.handleKeyMenu({ key: 'Escape' });
    expect(result).toBe(null);
    done();
  });
  it('renders with menuOpen', (done) => {
    const aT = new AppTemplate({ dispatch: () => Promise.resolve(true) });
    aT.state.menuOpen = true;
    const result = aT.render();
    expect(result.props.className).toBe('page-host');
    done();
  });
  it('checks if menu is google logout', () => {
    const { wrapper } = setup();
    wrapper.instance().menuItem({ type: 'googleLogout' }, 1);
    expect(wrapper.find('div.googleLogout').exists()).toBe(true);
  });
});
