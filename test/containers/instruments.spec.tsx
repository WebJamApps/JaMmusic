import React from 'react';
import { shallow } from 'enzyme';
import Instruments from '../../src/containers/Music/instruments';

function setup() {
  const props = {};
  const wrapper = shallow(<Instruments type="Maria" />);
  return { wrapper, props };
}

describe('Instruments', () => {
  it('renders Maria list', () => {
    const { wrapper } = setup();
    expect(wrapper.find('.instruments').exists()).toBe(true);
  });
});
