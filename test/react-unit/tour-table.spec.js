import React from 'react';
import { shallow } from 'enzyme';
import { TourTable } from '../../src/components/tour-table';

function setup() {
  const props = {};
  const wrapper = shallow(<TourTable />);
  return { wrapper, props };
}

describe('tour-table component test', () => {
  it('renders the component', () => {
    const { wrapper } = setup();
    // console.log(wrapper.debug());
    expect(wrapper.find('.tourTable').exists()).toBe(true);
  });
});
