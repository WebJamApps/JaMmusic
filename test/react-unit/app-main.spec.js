import React from 'react';
import { shallow } from 'enzyme';
import { AppTemplate } from '../../src/components/app-main';


function setup() {
  const props = {};
  const wrapper = shallow(<AppTemplate />);
  return { wrapper, props };
}


describe('picture slider component test setup', () => {
  it('renders the component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('div.page-host').exists()).toBe(true);
  });
});
