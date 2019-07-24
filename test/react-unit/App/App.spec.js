import React from 'react';
import { shallow } from 'enzyme';
import { App } from '../../../src/App';

describe('App component', () => {
  const dp = fun => fun;
  const wrapper = shallow(<App dispatch={dp} />);
  it('renders the component', () => {
    expect(wrapper.find('div#App').exists()).toBe(true);
  });
});
