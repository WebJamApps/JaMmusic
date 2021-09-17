/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ShowTimeButton } from '../../../src/containers/MusicDashboard/ShowTimeButton';

describe('ShowTimeButton function', () => {
  it('handles click to show the time widget', () => {
    const setShowTime = jest.fn();
    const wrapper = shallow(<ShowTimeButton time='' setShowTime={setShowTime}/>);
    expect(wrapper).toMatchSnapshot(); 
    wrapper.find('button.show-clock').simulate('click');
    expect(setShowTime).toHaveBeenCalled();
  });
});
