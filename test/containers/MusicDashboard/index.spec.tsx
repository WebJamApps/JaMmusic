import * as React from 'react';
import { shallow } from 'enzyme';
import { Redirect } from 'react-router-dom';
import { MusicDashboard } from '../../../src/containers/MusicDashboard';

describe('Dashboard Container', () => {
  let wrapper: any;
  const auth = { token: '' };
  beforeEach(() => {
    wrapper = shallow(<MusicDashboard auth={auth} scc={{ transmit: () => {} }} dispatch={() => {}} editTour={{}} />);
  });
  it('is defined', () => {
    expect(MusicDashboard).toBeDefined();
  });
  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
  it('calls on change', () => {
    wrapper.instance().checkEdit = jest.fn();
    wrapper.instance().setState = jest.fn((boobyJ) => { expect(boobyJ.hi).toBe(11); });
    wrapper.instance().onChange({ preventDefault: () => {}, target: { id: 'hi', value: 11 } });
  });
  it('calls handleEditorChange', () => {
    wrapper.instance().checkEdit = jest.fn();
    wrapper.instance().setState = jest.fn((obj) => { expect(obj.venue).toBe('<p>Cool Venue</p>'); });
    wrapper.instance().handleEditorChange('<p>Cool Venue</p>');
  });
  it('calls the tour API', () => {
    wrapper.instance().setState = jest.fn((obJ) => { expect(obJ.redirect).toBe(true); });
    wrapper.instance().createTourApi({ date: '2019-10-10' });
  });
  it('redirects to /music', () => new Promise((done) => {
    wrapper.setState({ redirect: true });
    expect(wrapper.find(Redirect).length).toBe(1);
    done();
  }));
  it('returns the validation', () => {
    wrapper.setState({
      date: '10-24-2019',
      time: '10:00',
      location: 'A place',
      venue: 'Venue',
    });
    const result = wrapper.instance().validateForm();
    expect(result).toBe(false);
  });
  it('creates the tour', () => {
    wrapper.setState({
      date: '10-24-2019',
      time: '10:00',
      location: 'A place',
      venue: 'Venue',
      tickets: '1',
      more: 'yes',
    });
    const result = wrapper.instance().createTour();
    expect(result).toBe(true);
  });
  it('renders with edit tour', () => {
    const wrapper2 = shallow(<MusicDashboard
      auth={auth}
      scc={{ transmit: () => {} }}
      dispatch={() => {}}
      editTour={{
        datetime: '2020-10-10T000',
        _id: '123',
        date: '2020-10-10',
        time: '5 pm',
        tickets: 'free',
        more: '',
        venue: 'beer garden',
        location: 'salem, va',
      }}
    />);
    expect(wrapper2.find('h5').text()).toBe('Edit Tour Event');
  });
  it('checks edit when editTour', () => {
    const wrapper2 = shallow(<MusicDashboard
      auth={auth}
      scc={{ transmit: () => {} }}
      dispatch={() => {}}
      editTour={{
        datetime: '2020-10-10T000',
        _id: '123',
        date: '2020-10-10',
        time: '5 pm',
        tickets: 'free',
        more: '',
        venue: 'beer garden',
        location: 'salem, va',
      }}
    />);
    wrapper.instance().setState = jest.fn((obj) => expect(obj.venue).toBe('beer garden'));
    // @ts-ignore
    wrapper2.instance().checkEdit();
  });
  it('checks edit when not editTour', () => {
    const wrapper2 = shallow(<MusicDashboard
      auth={auth}
      scc={{ transmit: () => {} }}
      dispatch={() => {}}
      editTour={{}}
    />);
    wrapper.instance().setState = jest.fn((obj) => expect(obj.venue).toBe(''));
    // @ts-ignore
    wrapper2.instance().checkEdit();
  });
  it('resets edit form when editTour', () => {
    const wrapper2 = shallow(<MusicDashboard
      auth={auth}
      scc={{ transmit: () => {} }}
      dispatch={() => {}}
      editTour={{
        datetime: '2020-10-10T000',
        _id: '123',
        date: '2020-10-10',
        time: '5 pm',
        tickets: 'free',
        more: '',
        venue: 'beer garden',
        location: 'salem, va',
      }}
    />);
    // @ts-ignore
    wrapper2.instance().setState = jest.fn((obj) => expect(obj.venue).toBe(''));
    // @ts-ignore
    wrapper2.instance().resetEditForm({ preventDefault: () => {} });
  });
  it('calls edit tour api', async () => {
    const wrapper2 = shallow(<MusicDashboard
      auth={auth}
      scc={{ transmit: () => {} }}
      dispatch={() => {}}
      editTour={{
        datetime: '2020-10-10T000',
        _id: '123',
        date: '2020-10-10',
        time: '5 pm',
        tickets: 'free',
        more: '',
        venue: 'beer garden',
        location: 'salem, va',
      }}
    />);
    wrapper2.setState({
      datetime: '2020-10-10T000',
      _id: '123',
      date: '2020-10-10',
      time: '5 pm',
      tickets: 'free',
      more: '',
      venue: 'beer garden',
      location: 'salem, va',
    });
    // @ts-ignore
    const r = wrapper2.instance().editTourAPI();
    expect(r).toBe(true);
  });
});
