import React from 'react';
import { shallow } from 'enzyme';
import { Redirect } from 'react-router-dom';
import { MusicDashboard } from '../../../src/containers/MusicDashboard';

describe('Dashboard Container', () => {
  let wrapper;
  beforeEach(() => {
    const auth = { token: '' };
    wrapper = shallow(<MusicDashboard auth={auth} scc={{ emit: () => {} }} />);
  });
  it('is defined', () => {
    expect(MusicDashboard).toBeDefined();
  });
  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
  it('calls on change', () => {
    wrapper.instance().setState = jest.fn((boobyJ) => { expect(boobyJ.hi).toBe(11); });
    wrapper.instance().onChange({ preventDefault: () => {}, target: { id: 'hi', value: 11 } });
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
});
