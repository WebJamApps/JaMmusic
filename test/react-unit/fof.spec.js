import React from 'react';
import { shallow } from 'enzyme';
import FourOhFour from '../../src/containers/404';


function setup() {
  const props = {};
  const wrapper = shallow(<FourOhFour />);
  return { wrapper, props };
}


describe('picture slider component test setup', () => {
  it('renders the component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('div.page-content').exists()).toBe(true);
  });
});
