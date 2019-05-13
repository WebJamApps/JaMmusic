import React from 'react';
import { shallow } from 'enzyme';
import { AppTemplate } from '../../src/components/app-main';

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
    let result;
    try { result = await aT.responseGoogleLogin({ code: 'somethingHere' }); } catch (e) { throw e; }
    console.log(result);
    expect(result).toBe(true);
  });
});
