import React from 'react';
import { shallow } from 'enzyme';
import Originals from '../../src/containers/Originals';
import MusicPlayer from '../../src/components/MusicPlayer';

function setup() {
  const props = {};
  
  const wrapper = shallow(<Originals {...props} />);
  return { wrapper, props };
}

describe('Original Music component init', () => {
  it('renders the Original component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('div.page-content').exists()).toBe(true);
  });

  it('expect the presence of Music player', () => {
    const { wrapper } = setup();
    expect(wrapper.find(MusicPlayer).exists()).toBe(true);
  });
});
