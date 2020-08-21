import React from 'react';
import { mount, shallow } from 'enzyme';
import { MusicPlayer, MusicPlayerState } from '../../../src/components/MusicPlayer';
import TSongs from '../../testSongs';

function setup() {
  window.document.body.innerHTML = '<div id="sidebar"></div><div id="header"/><div id="contentBlock"/>'
    + '<div id="wjfooter"/><div id="mobilemenutoggle"/><div id="pageContent"/><h4 id="headerTitle">'
    + '<div id="mainPlayer"/>';

  const wrapper = mount<MusicPlayer>(<MusicPlayer songs={TSongs} filterBy="original" />, {
    attachTo: document.getElementById('sidebar'),
  });
  return { wrapper };
}

describe('Music player component init', () => {
  it('renders the Music Player component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('div#player').exists()).toBe(true);
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
    const mp = new MusicPlayer({
      songs: [{
        _id: '123', url: '', category: '', title: '', image: '',
      }, {
        _id: '456', url: '', category: '', title: '', image: '',
      }],
      filterBy: '',
    });
    mp.state = {
      song: {
        _id: '789', url: '', category: '', title: '',
      },
      songsState: [{
        _id: '123', url: '', category: '', title: '',
      }, {
        _id: '456', url: '', category: '', title: '',
      }],
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
    mp.setState = (obj: MusicPlayerState) => {
      if (obj && obj.song)expect(obj.song._id).not.toBe('789');
    };
    mp.shuffle();
  });
  it('should find and simulate stop shuffle and confirm shuffling is off', () => {
    const { wrapper } = setup();
    wrapper.instance().setState({ index: 100 });
    wrapper.instance().playEnd();
    expect(wrapper.instance().state.index).toBe(0);
  });
  it('advances to the next song', () => {
    const mp = new MusicPlayer({
      songs: [{
        _id: '123', url: '', category: '', title: '',
      }, {
        _id: '456', url: '', category: '', title: '',
      }],
      filterBy: '',
    });
    mp.state = {
      index: 0,
      songsState: [{
        _id: '123', url: '', category: 'original', title: '',
      }, {
        _id: '456', url: '', category: 'original', title: '',
      }],
      copy: ['{ _id: "123" }', '{ _id: "456" }'],
      player: {
        isShuffleOn: false, playing: true, shown: true, displayCopier: '', displayCopyMessage: false, onePlayerMode: false,
      },
      missionState: 'off',
      pageTitle: 'Original',
      pubState: 'off',
      originalState: 'on',
      song: {
        _id: '789', url: '', category: 'original', title: '',
      },
    };
    mp.setState = (obj: MusicPlayerState) => { expect(obj.index).toBe(1); };
    mp.next();
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
  it('hides copier message after showing for 1.5s', () => {
    const { wrapper } = setup();
    wrapper.instance().navigator = { ...navigator, clipboard: { ...navigator.clipboard, writeText: () => Promise.resolve() } };
    wrapper.update();
    jest.runOnlyPendingTimers();
    wrapper.instance().musicPlayerUtils.copyShare(wrapper.instance());
    expect(wrapper.instance().state.player.displayCopier).toBe('none');
  });
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
  it('returns a default playUrl', () => {
    const { wrapper } = setup();
    wrapper.instance().setState({ song: null });
    const result = wrapper.instance().playUrl();
    expect(result).toBe('https://web-jam.com/music/songs');
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
    const songs = [{
      _id: '123', url: 'yes.com', category: 'mission', title: 'A Song',
    }];
    const result = wrapper.instance().musicUtils.setIndex(songs, 'mission');
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
    const songsState = [{
      _id: '123', url: 'yes.com', category: 'mission', title: 'A Song',
    }];
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
    const songsState = [{
      _id: '123', url: 'yes.com', category: 'mission', title: 'A Song',
    }];
    const pubState = 'on';
    if (pubState === 'on') {
      let reset = songsState;
      reset = wrapper.instance().musicUtils.setIndex(reset, 'mission');
      expect(reset).toBeTruthy();
    }
  });
  it('checks if youtube is about to be played', () => {
    const song = {
      _id: '123', category: 'mission', title: 'Hey Red', url: 'https://www.youtube.com/embed/mCvUBjuzfo8',
    };
    const wrapper = shallow<MusicPlayer>(<MusicPlayer songs={TSongs} filterBy="originals" />);
    wrapper.instance().setState({
      song,
      player: {
        isShuffleOn: false, playing: false, shown: true, displayCopier: '', displayCopyMessage: false, onePlayerMode: false,
      },
    });
    const overlay = wrapper.instance().setClassOverlay();
    const setPlayerClassStyle = wrapper.instance().musicUtils.setPlayerStyle(song);
    expect(setPlayerClassStyle).toStrictEqual({
      backgroundImage: '',
      backgroundColor: '#eee',
      textAlign: 'center',
      backgroundPosition: 'center',
      backgroundSize: '80%',
      backgroundRepeat: 'no-repeat',
    });
    expect(overlay).toBe('youtubeOverlay');
  });
  it('checks if soundcloud is about to be played', () => {
    const song = {
      _id: '123', category: 'mission', title: 'lord', url: 'https://soundcloud.com/joshandmariamusic/ithelordofseaandskyhereiamlord',
    };
    const wrapper = shallow<MusicPlayer>(<MusicPlayer songs={TSongs} filterBy="originals" />);
    wrapper.instance().setState({
      song,
      player: {
        isShuffleOn: false, playing: false, shown: true, displayCopier: '', displayCopyMessage: false, onePlayerMode: false,
      },
    });
    const overlay = wrapper.instance().setClassOverlay();
    expect(overlay).toBe('soundcloudOverlay');
  });
  it('checks if dropbox is about to be played', () => {
    const song = {
      _id: '123', category: 'mission', title: 'Hey Red', url: 'something.test.com',
    };
    const wrapper = shallow<MusicPlayer>(<MusicPlayer songs={TSongs} filterBy="originals" />);
    wrapper.instance().setState({
      song,
      player: {
        isShuffleOn: false, playing: false, shown: true, displayCopier: '', displayCopyMessage: false, onePlayerMode: false,
      },
    });
    const setPlayerClassStyle = wrapper.instance().musicUtils.setPlayerStyle(song);
    expect(setPlayerClassStyle).toStrictEqual({
      backgroundImage: 'url("/static/imgs/webjamlogo1.png")',
      backgroundColor: '#2a2a2a',
      textAlign: 'center',
      backgroundPosition: 'center',
      backgroundSize: '80%',
      backgroundRepeat: 'no-repeat',
    });
  });
});
