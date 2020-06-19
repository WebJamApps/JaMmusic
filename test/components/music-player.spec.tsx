import React from 'react';
import { mount, shallow } from 'enzyme';
import { MusicPlayer, MusicPlayerState } from '../../src/components/MusicPlayer';
import songData from '../../src/App/songs.json';

function setup() {
  const { songs } = songData;

  window.document.body.innerHTML = '<div id="sidebar"></div><div id="header"/><div id="contentBlock"/>'
    + '<div id="wjfooter"/><div id="mobilemenutoggle"/><div id="pageContent"/><h4 id="headerTitle">'
    + '<div id="mainPlayer"/>';

  const wrapper = mount<MusicPlayer>(<MusicPlayer songs={songs} filterBy="original" />, {
    attachTo: document.getElementById('sidebar'),
  });
  return { wrapper };
}

describe('Music player component init', () => {
  it('renders the Music Player component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('#mainPlayer').exists()).toBe(true);
  });
  it('should find and simulate play/pause', () => {
    const { wrapper } = setup();
    wrapper.setState({
      player: {
        playing: false, isShuffleOn: false, onePlayerMode: true, shown: true, displayCopier: '', displayCopyMessage: true,
      },
    });
    wrapper.find('button#play-pause').simulate('click');
    expect(wrapper.instance().state.player.playing).toBe(true);
  });
  it('should simulate the pause function', () => {
    const { wrapper } = setup();
    wrapper.instance().pause();
    expect(wrapper.instance().state.player.playing).toBe(false);
  });
  it('shuffles the songs', () => {
    const mp = new MusicPlayer({ songs: ['{ _id: "123" }', '{ _id: "456" }'], filterBy: '' });
    mp.state = {
      song: { _id: '789' },
      songsState: ['{ _id: "123" }', '{ _id: "456" }'],
      copy: ['{ _id: "123" }', '{ _id: "456" }'],
      player: {
        isShuffleOn: false, playing: true, shown: true, displayCopier: '', displayCopyMessage: false, onePlayerMode: false,
      },
      missionState: 'off',
      pubState: 'off',
      originalState: 'on',
      pageTitle: 'Originals',
      index: 0,
    };
    mp.setState = (obj: MusicPlayerState) => { expect(obj.song._id).not.toBe('789'); };
    mp.shuffle();
  });
  it('should find and simulate stop shuffle and confirm shuffling is off', () => {
    const { wrapper } = setup();
    wrapper.instance().setState({ index: 100 });
    wrapper.instance().playEnd();
    expect(wrapper.instance().state.index).toBe(0);
  });
  it('advances to the next song', () => {
    const mp = new MusicPlayer({ songs: ['{ _id: "123" }', '{ _id: "456" }'], filterBy: '' });
    mp.state = {
      index: 0,
      songsState: ['{ _id: "123" }', '{ _id: "456" }'],
      copy: ['{ _id: "123" }', '{ _id: "456" }'],
      player: {
        isShuffleOn: false, playing: true, shown: true, displayCopier: '', displayCopyMessage: false, onePlayerMode: false,
      },
      missionState: 'off',
      pageTitle: 'Original',
      pubState: 'off',
      originalState: 'on',
      song: { _id: '789' },
    };
    mp.setState = (obj: MusicPlayerState) => { expect(obj.index).toBe(1); };
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
    wrapper.instance().navigator = { ...navigator, clipboard: { ...navigator.clipboard, writeText: () => Promise.resolve() } };
    wrapper.update();
    wrapper.find('#copyButton').simulate('click');
    expect(wrapper.instance().state.player.displayCopier).toBe('none');
  });
  it('hides copier message after showing for 1.5s', () => new Promise((done) => {
    const { wrapper } = setup();
    wrapper.instance().navigator = { ...navigator, clipboard: { ...navigator.clipboard, writeText: () => Promise.resolve() } };
    wrapper.update();
    wrapper.instance().musicPlayerUtils.copyShare(wrapper.instance());
    expect(wrapper.instance().state.player.displayCopier).toBe('none');
    setTimeout(() => done(), 1501);
  }));
  it('toggles off copying/share pane', () => {
    const { wrapper } = setup();
    wrapper.instance().setState({
      player: {
        isShuffleOn: false, playing: true, shown: true, displayCopier: 'block', displayCopyMessage: false, onePlayerMode: false,
      },
    });
    wrapper.instance().musicPlayerUtils.share(wrapper.instance());
    expect(wrapper.instance().state.player.displayCopier).toBe('none');
  });
  it('toggles on copying/share pane', () => {
    const { wrapper } = setup();
    wrapper.instance().setState({
      player: {
        isShuffleOn: false, playing: true, shown: true, displayCopier: 'none', displayCopyMessage: false, onePlayerMode: false,
      },
    });
    wrapper.instance().musicPlayerUtils.share(wrapper.instance());
    expect(wrapper.instance().state.player.displayCopier).toBe('block');
  });
  it('returns a null playUrl', () => {
    const { wrapper } = setup();
    wrapper.instance().setState({ song: null });
    const result = wrapper.instance().playUrl();
    expect(result).toBe(null);
  });
  it('should simulate a click on adding mission/pub song types when either is off', () => {
    const { wrapper } = setup();
    wrapper.find('button.puboff').simulate('click');
    expect(wrapper.instance().state.pubState).toBe('on');
  });
  it('should simulate a click on adding mission/pub song types when either is on', () => {
    const { wrapper } = setup();
    wrapper.instance().setState({ missionState: 'on' });
    wrapper.find('button.missionoff').simulate('click');
    expect(wrapper.instance().state.missionState).toBe('off');
  });
  it('should simulate a click on original song type button', () => {
    const { wrapper } = setup();
    wrapper.instance().setState({ missionState: 'on', originalState: 'on' });
    wrapper.find('button.originalon').simulate('click');
    expect(wrapper.instance().state.originalState).toBe('off');
  });
  it('should resort songs', async () => {
    const { wrapper } = setup();
    const songs = ['mission'];
    const result = await wrapper.instance().musicUtils.setIndex(songs, 'mission');
    expect(result).toBeTruthy();
  });
  it('allows click on share button', () => {
    const { wrapper } = setup();
    wrapper.instance().musicPlayerUtils.share = jest.fn();
    wrapper.update();
    const buttons = wrapper.instance().buttons();
    const renderButtons = shallow(buttons);
    renderButtons.find('button#share-button').simulate('click');
    expect(wrapper.instance().musicPlayerUtils.share).toHaveBeenCalled();
  });
  it('should reset songs if missionState on', async () => {
    const { wrapper } = setup();
    wrapper.instance().setState({
      player: {
        isShuffleOn: true, playing: true, shown: true, displayCopier: '', displayCopyMessage: false, onePlayerMode: false,
      },
      missionState: 'off',
    });
    wrapper.find('button.missionoff').simulate('click');
    wrapper.find('button#shuffle').simulate('click');
    const songsState = ['mission'];
    const missionState = 'on';
    if (missionState === 'on') {
      let reset = songsState;
      reset = wrapper.instance().musicUtils.setIndex(reset, 'mission');
      expect(reset).toBeTruthy();
    }
  });
  it('should reset songs if pubState on', async () => {
    const { wrapper } = setup();
    wrapper.instance().setState({
      player: {
        isShuffleOn: true, playing: true, shown: true, displayCopier: 'none', displayCopyMessage: false, onePlayerMode: false,
      },
      pubState: 'off',
    });
    wrapper.find('button.puboff').simulate('click');
    wrapper.find('button#shuffle').simulate('click');
    const songsState = ['pub'];
    const pubState = 'on';
    if (pubState === 'on') {
      let reset = songsState;
      reset = wrapper.instance().musicUtils.setIndex(reset, 'mission');
      expect(reset).toBeTruthy();
    }
  });
  it('checks if youtube is about to be played', () => {
    const { songs } = songData;
    const song = { url: 'https://www.youtube.com/embed/mCvUBjuzfo8' };
    const wrapper = shallow<MusicPlayer>(<MusicPlayer songs={songs} filterBy="originals" />);
    wrapper.instance().setState({
      song,
      player: {
        isShuffleOn: false, playing: false, shown: true, displayCopier: '', displayCopyMessage: false, onePlayerMode: false,
      },
    });
    const overlay = wrapper.instance().setClassOverlay();
    expect(overlay).toBe('youtubeOverlay');
  });
  it('handles null song when textUnderPlayer', () => {
    const { songs } = songData;
    const wrapper = shallow<MusicPlayer>(<MusicPlayer songs={songs} filterBy="originals" />);
    const r = wrapper.instance().musicUtils.textUnderPlayer(null);
    expect(r.type).toBe('section');
  });
});
