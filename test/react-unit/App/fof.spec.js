import React from 'react';
import { shallow } from 'enzyme';
import FourOhFour from '../../../src/App/404';

function setup() {
  const props = {};
  const wrapper = shallow(<FourOhFour />);
  return { wrapper, props };
}

describe('/404', () => {
  it('renders the component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('div.page-content').exists()).toBe(true);
  });
});
