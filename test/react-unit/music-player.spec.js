import React from 'react';
import { mount } from 'enzyme';
import MusicPlayer from '../../src/components/MusicPlayer';
import songData from '../../src/containers/songs';

function setup() {
  const songs = songData.songs.filter(song => song.category === 'originals');
  const copy = Array.from(songData.songs.filter(song => song.category === 'originals'));
  
  const props = { songs, copy };

  const wrapper = mount(<MusicPlayer {...props} />);
  return { wrapper, props };
}

describe('Music player component init', () => {
  it('renders the Music Player component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('#mainPlayer').exists()).toBe(true);
  });

  it('should find and simulate play/pause', () => {
    const { wrapper } = setup();
    wrapper.find('button#play-pause').simulate('click');
    expect(wrapper.instance().state.player.playing).toBe(true);
  });

  it('should simulate the pause function', () => {
    const { wrapper } = setup();
    wrapper.instance().pause();
    expect(wrapper.instance().state.player.playing).toBe(false);
  });

  it('should find and simulate shuffle', () => {
    const { wrapper } = setup();
    wrapper.find('button#shuffle').simulate('click');
    expect(wrapper.instance().state.player.isShuffleOn).toBe(true);
  });
  
  it('should find and simulate a next song function', () => {
    const { wrapper } = setup();
    wrapper.find('button#next').simulate('click');
    expect(wrapper.instance().state.index).toBe(1);
  });
  
  it('should find and simulate a previous song function', () => {
    const { wrapper } = setup();
    wrapper.find('button#prev').simulate('click');
    expect(wrapper.instance().state.index).not.toBe(0);
  });
  
  it('should find and copy a playing song url', () => {
    const { wrapper } = setup();
    wrapper.instance().navigator = { clipboard: { async writeText(arg) { return arg; } } };
    wrapper.update();
    wrapper.find('#copyButton').simulate('click');
  });

  it('should test props passed to Music Player', () => {
    const { wrapper, props } = setup();
    expect(wrapper.props().songs).toEqual(props.copy);
  });
});
