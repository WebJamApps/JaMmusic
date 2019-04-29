import React from 'react';
import { shallow } from 'enzyme';
import Music from '../../src/containers/music';


function setup() {
  const props = {};
  const wrapper = shallow(<Music />);
  return { wrapper, props };
}


describe('/music', () => {
  it('renders the component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('div.page-content').exists()).toBe(true);
  });
});
