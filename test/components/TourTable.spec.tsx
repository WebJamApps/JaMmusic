/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as React from 'react';
import { shallow } from 'enzyme';
import { TourTable } from '../../src/components/TourTable';

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
  });
  it('sets the columns with customBodyRender', () => {
    const { wrapper } = setup();
    expect(typeof wrapper.instance().setColumns).toBe('function');
    wrapper.instance().setColumns();
    // @ts-ignore
    const custom = wrapper.instance().state.columns[0].options.customBodyRender('<a href="http://collegelutheran.org/"'
      + ' rel="noopener noreferrer" target="_blank">College Lutheran Church</a>');
    // @ts-ignore
    expect(custom.type).toBe('div');
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
    // @ts-ignore
    const custom = wrapper2.instance().state.columns[5].options.customBodyRender(buttonjsx);
    // @ts-ignore
    expect(custom.type).toBe('div');
  });
  // it('handles click on delete tour button', () => {
  //   const tour:any = {
  //     _id: '123', venue: '', location: '', tickets: '',
  //   };
  //   const scc:any = { transmit: () => { } };
  //   const wrapper2 = shallow<TourTable>(<TourTable
  //     tour={[tour]}
  //     dispatch={() => { }}
  //     tourUpdated={false}
  //     deleteButton
  //     auth={{ token: 'token' }}
  //     scc={scc}
  //   />);
  //   wrapper2.instance().deleteTour = jest.fn();
  //   wrapper2.instance().deleteTour = jest.fn();
  //   wrapper2.update();
  //   const newArr = wrapper2.instance().addDeleteButton([tour]);
  //   console.log(newArr[0].modify);
  //   const button = shallow(newArr[0].modify);
  //   console.log(button.debug());
  //   // button.find('button#deletePic456').simulate('click');
  //   // expect(wrapper2.instance().deleteTour).toHaveBeenCalled();
  // });
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
    const loc = window.location;
    delete window.location;
    window.location = {
      ...loc,
      href: '/',
      assign: jest.fn(),
      reload: jest.fn(),
    };
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
  // it('handles click on edit pic button', () => {
  //   const tour:any = {
  //     _id: '123', venue: '', location: '', tickets: '',
  //   };
  //   const scc:any = { transmit: () => { } };
  //   const wrapper2 = shallow<TourTable>(<TourTable
  //     tour={[tour]}
  //     dispatch={() => { }}
  //     tourUpdated={false}
  //     deleteButton
  //     auth={{ token: 'token' }}
  //     scc={scc}
  //   />);
  //   wrapper2.instance().editTour = jest.fn();
  //   wrapper2.update();
  //   const newArr = wrapper2.instance().addDeleteButton([tour]);
  //   const button:any = shallow(newArr[0].modify);
  //   button.find('button#editPic456').simulate('click');
  //   expect(wrapper2.instance().editTour).toHaveBeenCalled();
  // });
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
