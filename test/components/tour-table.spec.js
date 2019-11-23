import React from 'react';
import { shallow } from 'enzyme';
import { TourTable } from '../../src/components/tour-table';

function setup() {
  const props = {};
  const tour = [];
  const wrapper = shallow(<TourTable tour={tour} dispatch={() => {}} tourUpdated={false} />);
  return { wrapper, props };
}

describe('tour-table component test', () => {
  it('renders the component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('.tourTable').exists()).toBe(true);
  });
  it('sets the columns with customBodyRender', () => {
    const { wrapper } = setup();
    expect(typeof wrapper.instance().setColumns).toBe('function');
    wrapper.instance().setColumns();
    wrapper.instance().state.columns[0].options.customBodyRender('<a href="http://collegelutheran.org/"'
      + ' rel="noopener noreferrer" target="_blank">College Lutheran Church</a>');
  });
  it('rebuilds the tour table after the data updates', async () => {
    const { wrapper } = setup();
    const result = await wrapper.instance().checkTourTable(false, true);
    expect(result).toBe(true);
  });
});
