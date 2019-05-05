import React from 'react';
import { shallow } from 'enzyme';
import { TourTable } from '../../src/components/tour-table';

const sinon = require('sinon');

function setup() {
  const props = {};
  const wrapper = shallow(<TourTable />);
  return { wrapper, props };
}

describe('tour-table component test', () => {
  it('renders the component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('.tourTable').exists()).toBe(true);
  });
  it('returns the json data', async () => {
    const tt = new TourTable();
    const jMock = sinon.mock(tt.jquery);
    jMock.expects('getJSON').resolves([{
      Date: 'Dec 7, 2018',
      Time: '6:00 pm',
      Location: 'Salem, VA',
      Venue: 'College Lutheran Church front porch, prior to the Salem Christmas parade',
      Tickets: 'Free'
    }]);
    const sMock = sinon.mock(tt);
    sMock.expects('setState').returns(true);
    let result;
    try {
      result = await tt.fetchJson();
    } catch (e) { throw e; }
    expect(result).toBe(true);
    jMock.restore();
    sMock.restore();
  });
  it('returns the json data error', async () => {
    const tt = new TourTable();
    const jMock = sinon.mock(tt.jquery);
    jMock.expects('getJSON').rejects(new Error('bad'));
    let result;
    try {
      result = await tt.fetchJson();
    } catch (e) { throw e; }
    expect(result).toBe(false);
    jMock.restore();
  });
});
