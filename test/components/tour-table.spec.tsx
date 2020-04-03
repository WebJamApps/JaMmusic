import * as React from 'react';
import { shallow } from 'enzyme';
import { TourTable } from '../../src/components/tour-table';

function setup() {
  const props = {};
  const tour = [];
  const wrapper = shallow(<TourTable tour={tour} dispatch={() => {}} tourUpdated={false} auth={{ token: 'token' }} scc={{ transmit: () => {} }} />);
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
    // @ts-ignore
    expect(typeof wrapper.instance().setColumns).toBe('function');
    // @ts-ignore
    wrapper.instance().setColumns();
    // @ts-ignore
    wrapper.instance().state.columns[0].options.customBodyRender('<a href="http://collegelutheran.org/"'
      + ' rel="noopener noreferrer" target="_blank">College Lutheran Church</a>');
  });
  it('rebuilds the tour table after the data updates', async () => {
    const { wrapper } = setup();
    // @ts-ignore
    const result = await wrapper.instance().checkTourTable(false, true);
    expect(result).toBe(true);
  });
  it('renders with delete buttons', () => {
    const wrapper2 = shallow(<TourTable
      tour={[{ _id: '123' }]}
      dispatch={() => {}}
      tourUpdated={false}
      deleteButton
      auth={{ token: 'token' }}
      scc={{ transmit: () => {} }}
    />);
    expect(wrapper2.find('.tourTable').exists()).toBe(true);
  });
  it('sets the columns with customBodyRender for Modify column', () => {
    const wrapper2 = shallow(<TourTable
      tour={[{ _id: '123' }]}
      dispatch={() => {}}
      tourUpdated={false}
      deleteButton
      auth={{ token: 'token' }}
      scc={{ transmit: () => {} }}
    />);
    const buttonjsx = (<button type="button" style={{ display: 'block' }}>howdy</button>);
    // @ts-ignore
    expect(typeof wrapper2.instance().setColumns).toBe('function');
    // @ts-ignore
    wrapper2.instance().setColumns();
    // @ts-ignore
    const custom = wrapper2.instance().state.columns[5].options.customBodyRender(buttonjsx);
    expect(custom.type).toBe('div');
  });
  it('handles click on delete tour button', () => {
    const wrapper2 = shallow(<TourTable
      tour={[{ _id: '123' }]}
      dispatch={() => {}}
      tourUpdated={false}
      deleteButton
      auth={{ token: 'token' }}
      scc={{ transmit: () => {} }}
    />);
    // @ts-ignore
    wrapper2.instance().deleteTour = jest.fn();
    wrapper2.update();
    // @ts-ignore
    const newArr = wrapper2.instance().addDeleteButton([{ url: 'url', _id: '456' }]);
    const button = shallow(newArr[0].modify);
    button.find('button#deletePic456').simulate('click');
    // @ts-ignore
    expect(wrapper2.instance().deleteTour).toHaveBeenCalled();
  });
  it('sends the deleteTour socket', async () => {
    const wrapper2 = shallow(<TourTable
      tour={[{ _id: '123' }]}
      dispatch={() => {}}
      tourUpdated={false}
      deleteButton
      auth={{ token: 'token' }}
      scc={{ transmit: () => {} }}
    />);
    // @ts-ignore
    global.confirm = jest.fn(() => true);
    delete window.location;
    // @ts-ignore
    window.location = {
      href: '/',
      assign: jest.fn(),
      reload: jest.fn(),
    };
    // @ts-ignore
    r = await wrapper2.instance().deleteTour('456');
    expect(r).toBe(true);
  });
  it('handles cancel on the deletTour', async () => {
    const wrapper2 = shallow(<TourTable
      tour={[{ _id: '123' }]}
      dispatch={() => {}}
      tourUpdated={false}
      deleteButton
      auth={{ token: 'token' }}
      scc={{ transmit: () => {} }}
    />);
    // @ts-ignore
    global.confirm = jest.fn(() => false);
    // @ts-ignore
    r = await wrapper2.instance().deleteTour('456');
    expect(r).toBe(false);
  });
});
