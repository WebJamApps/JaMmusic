import React from 'react';
import { shallow } from 'enzyme';
import { TourTable } from '../../src/components/tour-table';


function setup() {
  const props = {};
  const wrapper = shallow(<TourTable />);
  return { wrapper, props };
}


describe('picture slider component test setup', () => {
  it('renders the component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('table').exists()).toBe(true);
  });
});
