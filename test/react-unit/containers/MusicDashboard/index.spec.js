import React from 'react';
import { shallow } from 'enzyme';
import { MusicDashboard } from '../../../../src/containers/MusicDashboard';

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
});
