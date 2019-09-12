import React from 'react';
import { shallow } from 'enzyme';
import Home from '../../../src/App/Home';

const wrapper = shallow(<Home />);

const controller = {
  setState: () => true,
  props: { parentRef: null, onResize: null },
  state: { width: 100 },
};

function onResize(width) {
  this.setState({ width });
}

describe('Home', () => {
  it('Renders the homepage', () => {
    const width = 1200;
    expect(wrapper.find('div.page-content', controller, width).exists()).toBe(true);
  });
});
