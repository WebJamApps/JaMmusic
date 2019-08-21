import React from 'react';
import { shallow } from 'enzyme';
import { Originals } from '../../src/containers/Originals';
import DefaultMusicPlayer from '../../src/components/MusicPlayer';

function setup() {
  const songs = [{ url: '', category: 'originals' }, { url: '', category: 'originals' }];
  const wrapper = shallow(<Originals songs={songs} />);
  return { wrapper };
}

describe('Original Music component init', () => {
  it('renders the Original component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('div.page-content').exists()).toBe(true);
  });

  it('expect the presence of Music player', () => {
    const { wrapper } = setup();
    expect(wrapper.find(DefaultMusicPlayer).exists()).toBe(true);
  });
  it('should not display the music player', (done) => {
    const wrapper = shallow(<Originals />);
    expect(wrapper.find(DefaultMusicPlayer).exists()).toBe(false);
    done();
  });
});
