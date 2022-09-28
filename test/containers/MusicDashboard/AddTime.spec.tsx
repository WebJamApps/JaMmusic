/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { shallow } from 'enzyme';
import { PersistedTimeKeeper } from '../../../src/containers/MusicDashboard/PersistedTimeKeeper';
import AddTime from '../../../src/containers/MusicDashboard/AddTime';
import { ShowTimeButton } from '../../../src/containers/MusicDashboard/ShowTimeButton';

describe('AddTime function', () => {
  let wrapper: any;
  beforeEach(() => {
    wrapper = shallow(<AddTime setFormTime={() => {}} initTime="1:45 am" show />);
  });
  it('is defined', () => {
    expect(AddTime).toBeDefined();
    expect(wrapper.find(PersistedTimeKeeper).exists()).toBe(true);
  });
  it('renders correctly', () => { expect(wrapper).toMatchSnapshot(); });
  it('renders when init time is empty string', () => {
    const wrapper2 = shallow(<AddTime setFormTime={() => {}} initTime="" show />);
    expect(wrapper2.find(PersistedTimeKeeper).exists()).toBe(true);
    expect(wrapper2).toMatchSnapshot();
  });
  it('renders when show is false', () => {
    const wrapper3 = shallow(<AddTime setFormTime={() => {}} initTime="1:45 am" show={false} />);
    expect(wrapper3).toMatchSnapshot();
    expect(wrapper3.find(ShowTimeButton).exists()).toBe(true);
  });
});
