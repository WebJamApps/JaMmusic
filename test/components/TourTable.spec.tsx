/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { shallow } from 'enzyme';
import MUIDataTable from 'mui-datatables';
import { TourTable } from '../../src/components/TourTable';
import DTable from '../../src/components/TourTable/DataTable';

function setup() {
  const props = {};
  const tour: any[] = [];
  const scc: any = { transmit: () => { } };
  const wrapper = shallow<TourTable>(<TourTable
    tour={tour}
    dispatch={() => { }}
    tourUpdated={false}
    auth={{ token: 'token' }}
    scc={scc}
  />);
  return { wrapper, props };
}

describe('tour-table component test', () => {
  let r: boolean;
  it('renders the component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('.tourTable').exists()).toBe(true);
    expect(wrapper.find(DTable).dive().find(MUIDataTable).exists()).toBe(true);
  });
  it('sets the columns with customBodyRender and customHeadRender', () => {
    const { wrapper } = setup();
    expect(typeof wrapper.instance().setColumns).toBe('function');
    wrapper.instance().setColumns();
    const meta: any = {};
    const myOptions: any = wrapper.instance().state.columns[0].options;
    if (myOptions) {
      const customBody = myOptions.customBodyRender('<a href="http://collegelutheran.org/"'
        + ' rel="noopener noreferrer" target="_blank">College Lutheran Church</a>', meta, jest.fn());
      const customHead = myOptions.customHeadRender({ index: 1 });
      expect(customBody).toBeDefined();
      expect(customHead).toBeDefined();
    }
  });
  it('sets the columns with customBodyRender and customHeadRender for Time', () => {
    const { wrapper } = setup();
    expect(typeof wrapper.instance().setColumns).toBe('function');
    wrapper.instance().setColumns();
    const meta: any = {};
    const myOptions: any = wrapper.instance().state.columns[1].options;
    if (myOptions) {
      const customBody = myOptions.customBodyRender('<a href="http://collegelutheran.org/"'
        + ' rel="noopener noreferrer" target="_blank">College Lutheran Church</a>', meta, jest.fn());
      const customHead = myOptions.customHeadRender({ index: 1, label: 'Time' });
      expect(customBody).toBeDefined();
      expect(customHead).toBeDefined();
    }
  });
  it('rebuilds the tour table after the data updates', () => {
    const { wrapper } = setup();
    const result = wrapper.instance().checkTourTable(false, true);
    expect(result).toBe(true);
  });
  it('renders with delete buttons', () => {
    const tour: any = {
      _id: '123', venue: '', location: '', tickets: '',
    };
    const scc: any = { transmit: () => { } };
    const wrapper2 = shallow(<TourTable
      tour={[tour]}
      dispatch={() => { }}
      tourUpdated={false}
      deleteButton
      auth={{ token: 'token' }}
      scc={scc}
    />);
    expect(wrapper2.find('.tourTable').exists()).toBe(true);
  });
  it('sets the columns with customBodyRender for Modify column', () => {
    const tour: any = {
      _id: '123', venue: '', location: '', tickets: '',
    };
    const scc: any = { transmit: () => { } };
    const wrapper2 = shallow<TourTable>(<TourTable
      tour={[tour]}
      dispatch={() => { }}
      tourUpdated={false}
      deleteButton
      auth={{ token: 'token' }}
      scc={scc}
    />);
    const buttonjsx = (<button type="button" style={{ display: 'block' }}>howdy</button>);
    expect(typeof wrapper2.instance().setColumns).toBe('function');
    wrapper2.instance().setColumns();
    const myOptions: any = wrapper2.instance().state.columns[5].options;
    if (myOptions) {
      const custom = myOptions.customBodyRender(buttonjsx, undefined, undefined);
      expect(custom).toBeDefined();
    }
  });
  it('handles click on delete tour button', () => {
    const tour: any = {
      _id: '123', venue: '', location: '', tickets: '',
    };
    const scc: any = { transmit: () => { } };
    const wrapper2 = shallow<TourTable>(<TourTable
      tour={[tour]}
      dispatch={() => { }}
      tourUpdated={false}
      deleteButton
      auth={{ token: 'token' }}
      scc={scc}
    />);
    wrapper2.instance().deleteTour = jest.fn();
    wrapper2.instance().editTour = jest.fn();
    wrapper2.update();
    const newArr = wrapper2.instance().addDeleteButton([tour]);
    const button = shallow(newArr[0].modify || (<div />));
    button.find('button#deletePic123').simulate('click');
    expect(wrapper2.instance().deleteTour).toHaveBeenCalled();
  });
  it('sends the deleteTour socket', () => {
    const tour: any = {
      _id: '123', venue: '', location: '', tickets: '',
    };
    const scc: any = { transmit: () => { } };
    const wrapper2 = shallow<TourTable>(<TourTable
      tour={[tour]}
      dispatch={() => { }}
      tourUpdated={false}
      deleteButton
      auth={{ token: 'token' }}
      scc={scc}
    />);
    const globalAny: any = global;
    globalAny.confirm = jest.fn(() => true);
    Object.defineProperty(window, 'location', { value: { assign: () => { }, reload: () => { } }, writable: true });
    r = wrapper2.instance().deleteTour('456');
    expect(r).toBe(true);
  });
  it('handles cancel on the deletTour', async () => {
    const tour: any = {
      _id: '123', venue: '', location: '', tickets: '',
    };
    const scc: any = { transmit: () => { } };
    const wrapper2 = shallow<TourTable>(<TourTable
      tour={[tour]}
      dispatch={() => { }}
      tourUpdated={false}
      deleteButton
      auth={{ token: 'token' }}
      scc={scc}
    />);
    const globalAny: any = global;
    globalAny.confirm = jest.fn(() => false);
    r = wrapper2.instance().deleteTour('456');
    expect(r).toBe(false);
  });
  it('handles click on edit pic button', () => {
    const tour: any = {
      _id: '123', venue: '', location: '', tickets: '',
    };
    const scc: any = { transmit: () => { } };
    const wrapper2 = shallow<TourTable>(<TourTable
      tour={[tour]}
      dispatch={() => { }}
      tourUpdated={false}
      deleteButton
      auth={{ token: 'token' }}
      scc={scc}
    />);
    wrapper2.instance().editTour = jest.fn();
    wrapper2.update();
    const newArr = wrapper2.instance().addDeleteButton([tour]);
    const button = shallow(newArr[0].modify || (<div />));
    button.find('button#editPic123').simulate('click');
    expect(wrapper2.instance().editTour).toHaveBeenCalled();
  });
  it('stores the edit pic data to redux', () => {
    const tour: any = {
      _id: '123', venue: '', location: '', tickets: '',
    };
    const scc: any = { transmit: () => { } };
    const wrapper2 = shallow<TourTable>(<TourTable
      tour={[tour]}
      dispatch={() => { }}
      tourUpdated={false}
      deleteButton
      auth={{ token: 'token' }}
      scc={scc}
    />);
    const edittour = {
      date: '5-5-2020', time: '5:00 pm', tickets: 'no', more: 'no', venue: 'a venue', location: 'Salem', _id: '1',
    };
    r = wrapper2.instance().editTour(edittour);
    expect(r).toBe(true);
  });
  it('renders without tour data and handles delete', () => {
    const wrapper3 = shallow<TourTable>(<TourTable dispatch={jest.fn()} />);
    const globalAny: any = global;
    globalAny.confirm = jest.fn(() => true);
    expect(wrapper3.instance().deleteTour('1')).toBe(false);
  });
});
