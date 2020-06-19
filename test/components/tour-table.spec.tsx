import * as React from 'react';
import { shallow } from 'enzyme';
import { TourTable } from '../../src/components/tour-table';

function setup() {
  const props = {};
  const tour = [];
  const wrapper = shallow<TourTable>(<TourTable
    tour={tour}
    dispatch={() => {}}
    tourUpdated={false}
    auth={{ token: 'token' }}
    scc={{ transmit: () => {} }}
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
    wrapper.instance().state.columns[0].options.customBodyRender('<a href="http://collegelutheran.org/"'
      + ' rel="noopener noreferrer" target="_blank">College Lutheran Church</a>');
  });
  it('rebuilds the tour table after the data updates', async () => {
    const { wrapper } = setup();
    const result = await wrapper.instance().checkTourTable(false, true);
    expect(result).toBe(true);
  });
  it('renders with delete buttons', () => {
    const wrapper2 = shallow(<TourTable
      tour={[['{ _id: "123" }']]}
      dispatch={() => {}}
      tourUpdated={false}
      deleteButton
      auth={{ token: 'token' }}
      scc={{ transmit: () => {} }}
    />);
    expect(wrapper2.find('.tourTable').exists()).toBe(true);
  });
  it('sets the columns with customBodyRender for Modify column', () => {
    const wrapper2 = shallow<TourTable>(<TourTable
      tour={[['{ _id: "123" }']]}
      dispatch={() => {}}
      tourUpdated={false}
      deleteButton
      auth={{ token: 'token' }}
      scc={{ transmit: () => {} }}
    />);
    const buttonjsx = (<button type="button" style={{ display: 'block' }}>howdy</button>);
    expect(typeof wrapper2.instance().setColumns).toBe('function');
    wrapper2.instance().setColumns();
    const custom = wrapper2.instance().state.columns[5].options.customBodyRender(buttonjsx);
    expect(custom.type).toBe('div');
  });
  it('handles click on delete tour button', () => {
    const wrapper2 = shallow<TourTable>(<TourTable
      tour={[['{ _id: "123" }']]}
      dispatch={() => {}}
      tourUpdated={false}
      deleteButton
      auth={{ token: 'token' }}
      scc={{ transmit: () => {} }}
    />);
    wrapper2.instance().deleteTour = jest.fn();
    wrapper2.update();
    const newArr = wrapper2.instance().addDeleteButton([{ url: 'url', _id: '456' }]);
    const button = shallow(newArr[0].modify);
    button.find('button#deletePic456').simulate('click');
    expect(wrapper2.instance().deleteTour).toHaveBeenCalled();
  });
  it('sends the deleteTour socket', () => {
    const wrapper2 = shallow<TourTable>(<TourTable
      tour={[['{ _id: "123" }']]}
      dispatch={() => {}}
      tourUpdated={false}
      deleteButton
      auth={{ token: 'token' }}
      scc={{ transmit: () => {} }}
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
    const wrapper2 = shallow<TourTable>(<TourTable
      tour={[['{ _id: "123" }']]}
      dispatch={() => {}}
      tourUpdated={false}
      deleteButton
      auth={{ token: 'token' }}
      scc={{ transmit: () => {} }}
    />);
    const globalAny: any = global;
    globalAny.confirm = jest.fn(() => false);
    r = wrapper2.instance().deleteTour('456');
    expect(r).toBe(false);
  });
  it('handles click on edit pic button', () => {
    const wrapper2 = shallow<TourTable>(<TourTable
      tour={[['{ _id: "123" }']]}
      dispatch={() => {}}
      tourUpdated={false}
      deleteButton
      auth={{ token: 'token' }}
      scc={{ transmit: () => {} }}
    />);
    wrapper2.instance().editTour = jest.fn();
    wrapper2.update();
    const newArr = wrapper2.instance().addDeleteButton([{ url: 'url', _id: '456' }]);
    const button = shallow(newArr[0].modify);
    button.find('button#editPic456').simulate('click');
    expect(wrapper2.instance().editTour).toHaveBeenCalled();
  });
  it('stores the edit pic data to redux', () => {
    const wrapper2 = shallow<TourTable>(<TourTable
      tour={[['{ _id: "123" }']]}
      dispatch={() => {}}
      tourUpdated={false}
      deleteButton
      auth={{ token: 'token' }}
      scc={{ transmit: () => {} }}
    />);
    r = wrapper2.instance().editTour('');
    expect(r).toBe(true);
  });
});
