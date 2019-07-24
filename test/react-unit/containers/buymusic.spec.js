import React from 'react';
import { shallow } from 'enzyme';
import BuyMusic from '../../../src/containers/BuyMusic';

function setup() {
  const props = {};
  const wrapper = shallow(<BuyMusic />);
  return { wrapper, props };
}

describe('/music/buymusic', () => {
  it('renders the component', () => {
    const { wrapper } = setup();
    // console.log(wrapper.debug());
    expect(wrapper.find('div.page-content').exists()).toBe(true);
    expect(wrapper.find('JoshShermanBand').dive().find('.elevation2').exists()).toBe(true);
    expect(wrapper.find('JoshShermanSolo').dive().find('.elevation2').exists()).toBe(true);
  });
});
