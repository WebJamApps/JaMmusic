import React from 'react';
import { shallow } from 'enzyme';
import ShopMain from '../../src/containers/Shop/ShopMain';

function setup() {
  const props = {};
  const wrapper = shallow(<ShopMain />);
  return { props, wrapper };
}

describe('ShopMain', () => {
  it('Renders the ShopMain component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('div.page-content').exists()).toBe(true);
  });
});
