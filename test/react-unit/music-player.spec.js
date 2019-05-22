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

  it('should find and simulate shuffle and confirm shuffling is on', () => {
    const { wrapper } = setup();
    wrapper.find('button#shuffle').simulate('click');
    expect(wrapper.instance().state.player.isShuffleOn).toBe(true);
  });
  
  it('should find and simulate stop shuffle and confirm shuffling is off', () => {
    const { wrapper } = setup();
    wrapper.instance().setState({ index: 100 });
    wrapper.instance().playEnd();
    expect(wrapper.instance().state.index).toBe(0);
  });
  
  it('should test the end of the player', () => {
    const { wrapper } = setup();
    wrapper.instance().setState({ player: { isShuffleOn: true } });
    wrapper.find('button#shuffle').simulate('click');
    expect(wrapper.instance().state.player.isShuffleOn).toBe(false);
  });
  
  it('should find and simulate a next song function', () => {
    const { wrapper } = setup();
    wrapper.instance().next();
    expect(wrapper.instance().state.index).toBe(1);
  });
  
  it('should find and simulate a previous song function', () => {
    const { wrapper } = setup();
    wrapper.find('button#prev').simulate('click');
    expect(wrapper.instance().state.index).not.toBe(0);
  });
  
  it('should test previous song which has an index > 0', () => {
    const { wrapper } = setup();
    wrapper.instance().setState({ index: 1 });
    wrapper.instance().prev();
    expect(wrapper.instance().state.index).toBe(0);
  });
  
  it('should find and copy a playing song url', () => {
    const { wrapper } = setup();
    wrapper.instance().navigator = { clipboard: { async writeText(arg) { return arg; } } };
    wrapper.update();
    wrapper.find('#copyButton').simulate('click');
  
    expect(wrapper.instance().state.player.displayCopier).toBe('none');
  });
  
  it('should hide copier message after showing for 1.5s', (done) => {
    const { wrapper } = setup();
    wrapper.instance().navigator = { clipboard: { async writeText(arg) { return arg; } } };
    wrapper.update();
    wrapper.instance().copyShare();

    expect(wrapper.instance().state.player.displayCopier).toBe('none');
    
    setTimeout(() => done(), 1501);
  });

  it('should toggle off copying/share pane', () => {
    const { wrapper } = setup();
    wrapper.instance().setState({ player: { displayCopier: 'block' } });
    wrapper.instance().share();
    expect(wrapper.instance().state.player.displayCopier).toBe('none');
  });

  it('should test props passed to Music Player', () => {
    const { wrapper, props } = setup();
    expect(wrapper.props().songs).toEqual(props.copy);
  });
});
