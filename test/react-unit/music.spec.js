import React from 'react';
import { shallow } from 'enzyme';
import Music from '../../src/containers/music';

function setup() {
  const props = {};
  const wrapper = shallow(<Music />);
  return { wrapper, props };
}

describe('/music', () => {
  it('renders the component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('div.page-content').exists()).toBe(true);
    expect(wrapper.find('Intro').dive().find('.intro').exists()).toBe(true);
    expect(wrapper.find('JoshBio').dive().find('.joshBio').exists()).toBe(true);
    expect(wrapper.find('JoshBio').dive().find('Instruments').dive()
      .find('.instruments')
      .exists()).toBe(true);
    expect(wrapper.find('MariaBio').dive().find('.mariaBio').exists()).toBe(true);
    expect(wrapper.find('Wjband').dive().find('.wjBand').exists()).toBe(true);
    expect(wrapper.find('EmersonBio').dive().find('.emersonBio').exists()).toBe(true);
    expect(wrapper.find('BrianBio').dive().find('.brianBio').exists()).toBe(true);
  });
});
