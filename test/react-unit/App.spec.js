import React from 'react';
import { shallow } from 'enzyme';
import App from '../../src/App';


function setup() {
  const props = {};
  const wrapper = shallow(<App />);
  return { wrapper, props };
}


describe('App component', () => {
  it('renders the component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('div#App').exists()).toBe(true);
  });
});
