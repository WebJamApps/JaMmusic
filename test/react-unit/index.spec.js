import React from 'react';
import { shallow } from 'enzyme';
import App from '../../src/index';


function setup() {
  const props = {};
  const wrapper = shallow(<App />);
  return { wrapper, props };
}


describe('picture slider component test setup', () => {
  it('renders the component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('div#App').exists()).toBe(true);
  });
});
