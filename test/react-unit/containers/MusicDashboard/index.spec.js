import React from 'react';
import { shallow } from 'enzyme';
import { MusicDashboard } from '../../../../src/containers/MusicDashboard';

describe('Dashboard Container', () => {
  let wrapper;
  beforeEach(() => {
    const auth = { token: '' };
    wrapper = shallow(<MusicDashboard auth={auth} />);
  });
  it('is defined', () => {
    expect(MusicDashboard).toBeDefined();
  });
  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
