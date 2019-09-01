import React from 'react';
import { shallow } from 'enzyme';
import { TourTable } from '../../src/components/tour-table';

// const sinon = require('sinon');

function setup() {
  const props = {};
  const tour = [];
  const wrapper = shallow(<TourTable tour={tour} />);
  return { wrapper, props };
}

describe('tour-table component test', () => {
  it('renders the component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('.tourTable').exists()).toBe(true);
  });
  it('tests the tour-table columns', () => {
    const { wrapper } = setup();
    expect(typeof wrapper.instance().setColumns).toBe('function');
    wrapper.instance().setColumns();
    wrapper.instance().columns[0].options.customBodyRender('<a href="http://collegelutheran.org/"'
      + ' rel="noopener noreferrer" target="_blank">College Lutheran Church</a>');
  });
  // it('returns the json data', async () => {
  //   const tt = new TourTable();
  //   const jMock = sinon.mock(tt.jquery);
  //   jMock.expects('getJSON').resolves([
  //     {
  //       Date: 'Dec 7, 2018',
  //       Time: '6:00 pm',
  //       Location: 'Salem, VA',
  //       Venue: 'College Lutheran Church front porch, prior to the Salem Christmas parade',
  //       Tickets: 'Free',
  //     },
  //     {
  //       Date: 'Dec 24, 2018',
  //       Location: 'Salem, VA',
  //       Tickets: 'Freewill',
  //       Time: '4:30 pm',
  //       Venue: '<a href="http://collegelutheran.org/" rel="noopener noreferrer" target="_blank">College Lutheran Church</a>',
  //     },
  //   ]);
  //   const sMock = sinon.mock(tt);
  //   sMock.expects('setState').returns(true);
  //   const result = await tt.fetchJson();
  //   expect(result).toBe(true);
  //   jMock.restore();
  //   sMock.restore();
  // });
  // it('returns the json data error', async () => {
  //   const tt = new TourTable();
  //   const jMock = sinon.mock(tt.jquery);
  //   jMock.expects('getJSON').rejects(new Error('bad'));
  //   const result = await tt.fetchJson();
  //   expect(result).toBe(false);
  //   jMock.restore();
  // });
});
