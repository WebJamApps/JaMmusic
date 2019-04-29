import React from 'react';
import { shallow } from 'enzyme';
import BuyMusic from '../../src/containers/buymusic';


function setup() {
  const props = {};
  const wrapper = shallow(<BuyMusic />);
  return { wrapper, props };
}


describe('/music/buymusic', () => {
  it('renders the component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('div.page-content').exists()).toBe(true);
  });
});
