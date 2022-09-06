/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { shallow } from 'enzyme';
import TimeKeeper from 'react-timekeeper';
import { PersistedTimeKeeper } from '../../../src/containers/MusicDashboard/PersistedTimeKeeper';

describe('PersistedTimeKeeper function', () => {
  it('handles click to show the time widget', () => {
    const setShowTime = jest.fn();
    const setFormTime = jest.fn();
    const wrapper = shallow(<PersistedTimeKeeper time="" setShowTime={setShowTime} setFormTime={setFormTime} />);
    expect(wrapper).toMatchSnapshot();
    wrapper.find(TimeKeeper).get(0).props.onDoneClick();
    expect(setShowTime).toHaveBeenCalled();
    expect(setFormTime).toHaveBeenCalled();
  });
  it('handles onChange', () => {
    const setShowTime = jest.fn();
    const setFormTime = jest.fn();
    const onChange = jest.fn((cb) => cb({ formatted12: '' }));
    const wrapper = shallow(<PersistedTimeKeeper time="" setShowTime={setShowTime} setFormTime={setFormTime} />);
    expect(wrapper).toMatchSnapshot();
    wrapper.find(TimeKeeper).get(0).props.onChange(onChange);
    expect(setFormTime).toHaveBeenCalled();
  });
});
