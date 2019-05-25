import React from 'react';
import { mount } from 'enzyme';
import MusicPlayer from '../../src/components/MusicPlayer';
import songData from '../../src/containers/songs';

function setup() {
  const songs = songData.songs.filter(song => song.category === 'originals');
  const copy = Array.from(songData.songs.filter(song => song.category === 'originals'));

  const props = { songs, copy };
  
  window.document.body.innerHTML = '<div id="sidebar"></div><div id="header"/><div id="contentBlock"/>'
    + '<div id="wjfooter"/><div id="mobilemenutoggle"/><div id="pageContent"/>';

  const wrapper = mount(<MusicPlayer {...props} />, {
    attachTo: document.getElementById('sidebar'),
  });
  return { wrapper, props };
}

describe('Music player component init', () => {
  it('does nothing', (done) => {
    done();
  });

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

  it('shuffles the songs', () => {
    const mp = new MusicPlayer({ songs: [{ _id: '123' }, { _id: '456' }], copy: [{ _id: '123' }, { _id: '456' }] });
    mp.state = { songs: [{ _id: '123' }, { _id: '456' }], copy: [{ _id: '123' }, { _id: '456' }], player: { isShuffleOn: false } };
    mp.setState = () => {};
    mp.shuffle();
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

  it('advances to the next song', () => {
    const mp = new MusicPlayer({ songs: [{ _id: '123' }, { _id: '456' }], copy: [{ _id: '123' }, { _id: '456' }] });
    mp.state = {
      index: 0, songs: [{ _id: '123' }, { _id: '456' }], copy: [{ _id: '123' }, { _id: '456' }], player: { isShuffleOn: false },
    };
    mp.setState = () => {};
    mp.next();
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
  
  it('should toggle on copying/share pane', () => {
    const { wrapper } = setup();
    wrapper.instance().setState({ player: { displayCopier: 'none' } });
    wrapper.instance().share();
    expect(wrapper.instance().state.player.displayCopier).toBe('block');
  });

  it('should test props passed to Music Player', () => {
    const { wrapper, props } = setup();
    expect(wrapper.props().songs).toEqual(props.copy);
  });
  
  it('should test one player mode', () => {
    const { location } = window;
    delete window.location;
    
    window.location = {
      search: '?oneplayer=true&id=28ru9weis2309urihw9098ewuis',
      pathname: '/music/original',
      href: '/music',
    };

    const { wrapper } = setup();
    wrapper.update();
    
    // restore window
    window.location = location;
    expect(wrapper.instance().state.player.onePlayerMode).toBeTruthy();
  });
  
  it('finish off one-player mode to home', () => {
    const { wrapper } = setup();
    wrapper.find('button#h').simulate('click');
    expect(window.location.href).toBe(undefined);
  });
});
