import React from 'react';
import { shallow } from 'enzyme';
import { AppTemplate } from '../../src/components/app-main';

function setup() {
  const props = { children: '<div></div>' };
  const wrapper = shallow(<AppTemplate><div /></AppTemplate>);
  return { wrapper, props };
}

describe('app-main component test setup', () => {
  it('renders the component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('div.page-host').exists()).toBe(true);
  });
});
