import React from 'react';
import { shallow } from 'enzyme';
import { MusicPlayer, MusicPlayerState } from '../../../src/components/MusicPlayer';
import TSongs from '../../testSongs';

describe('Music player component init', () => {
  it('renders the Music Player component', () => {
    const wrapper = shallow<MusicPlayer>(<MusicPlayer songs={TSongs} filterBy="originals" />);
    expect(wrapper.find('div#player').exists()).toBe(true);
  });
  it('should find and simulate play/pause', () => {
    const wrapper = shallow<MusicPlayer>(<MusicPlayer songs={TSongs} filterBy="originals" />);
    wrapper.setState({
      player: {
        playing: false, isShuffleOn: false, onePlayerMode: true, shown: true, displayCopier: '', displayCopyMessage: true,
      },
    });
    wrapper.find('button#play-pause').simulate('click');
    expect(wrapper.instance().state.player.playing).toBe(true);
  });
  it('should simulate the pause function', () => {
    const wrapper = shallow<MusicPlayer>(<MusicPlayer songs={TSongs} filterBy="originals" />);
    wrapper.instance().pause();
    expect(wrapper.instance().state.player.playing).toBe(false);
  });
  it('shuffles the songs', () => {
    const mp = new MusicPlayer({
      songs: [{
        _id: '123', url: '', category: '', title: '', image: '', year: 2000,
      }, {
        _id: '456', url: '', category: '', title: '', image: '', year: 2003,
      }],
      filterBy: '',
    });
    mp.state = {
      song: {
        _id: '789', url: '', category: '', title: '', year: 2000,
      },
      songsState: [{
        _id: '123', url: '', category: '', title: '', year: 2003,
      }, {
        _id: '456', url: '', category: '', title: '', year: 2004,
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
    const wrapper = shallow<MusicPlayer>(<MusicPlayer songs={TSongs} filterBy="originals" />);
    wrapper.instance().setState({ index: 100 });
    wrapper.instance().playEnd();
    expect(wrapper.instance().state.index).toBe(0);
  });
  it('advances to the next song', () => {
    const mp = new MusicPlayer({
      songs: [{
        _id: '123', url: '', category: '', title: '', year: 2000,
      }, {
        _id: '456', url: '', category: '', title: '', year: 2003,
      }],
      filterBy: '',
    });
    mp.state = {
      index: 0,
      songsState: [{
        _id: '123', url: '', category: 'original', title: '', year: 2000,
      }, {
        _id: '456', url: '', category: 'original', title: '', year: 2003,
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
        _id: '789', url: '', category: 'original', title: '', year: 2000,
      },
    };
    mp.setState = (obj: MusicPlayerState) => { expect(obj.index).toBe(1); };
    mp.next();
  });
  it('should test previous song which has an index > 0', () => {
    const wrapper = shallow<MusicPlayer>(<MusicPlayer songs={TSongs} filterBy="originals" />);
    wrapper.instance().setState({ index: 1 });
    wrapper.instance().prev();
    expect(wrapper.instance().state.index).toBe(0);
  });
  it('should find and copy a playing song url', () => {
    const wrapper = shallow<MusicPlayer>(<MusicPlayer songs={TSongs} filterBy="originals" />);
    wrapper.instance().navigator = { ...navigator, clipboard: { ...navigator.clipboard, writeText: () => Promise.resolve() } };
    wrapper.update();
    wrapper.find('#copyButton').simulate('click');
    expect(wrapper.instance().state.player.displayCopier).toBe('none');
  });
  it('hides copier message after showing for 1.5s', () => {
    const wrapper = shallow<MusicPlayer>(<MusicPlayer songs={TSongs} filterBy="originals" />);
    wrapper.instance().navigator = { ...navigator, clipboard: { ...navigator.clipboard, writeText: () => Promise.resolve() } };
    wrapper.update();
    jest.runOnlyPendingTimers();
    wrapper.instance().musicPlayerUtils.copyShare(wrapper.instance());
    expect(wrapper.instance().state.player.displayCopier).toBe('none');
  });
  it('toggles off copying/share pane', () => {
    const wrapper = shallow<MusicPlayer>(<MusicPlayer songs={TSongs} filterBy="originals" />);
    wrapper.instance().setState({
      player: {
        isShuffleOn: false, playing: true, shown: true, displayCopier: 'block', displayCopyMessage: false, onePlayerMode: false,
      },
    });
    wrapper.instance().musicPlayerUtils.share(wrapper.instance());
    expect(wrapper.instance().state.player.displayCopier).toBe('none');
  });
  it('toggles on copying/share pane', () => {
    const wrapper = shallow<MusicPlayer>(<MusicPlayer songs={TSongs} filterBy="originals" />);
    wrapper.instance().setState({
      player: {
        isShuffleOn: false, playing: true, shown: true, displayCopier: 'none', displayCopyMessage: false, onePlayerMode: false,
      },
    });
    wrapper.instance().musicPlayerUtils.share(wrapper.instance());
    expect(wrapper.instance().state.player.displayCopier).toBe('block');
  });
  it('returns a default playUrl', () => {
    const wrapper = shallow<MusicPlayer>(<MusicPlayer songs={TSongs} filterBy="originals" />);
    wrapper.instance().setState({ song: null });
    const result = wrapper.instance().playUrl();
    expect(result).toBe('https://web-jam.com/music/songs');
  });
  it('should simulate a click on original song type button', () => {
    const wrapper = shallow<MusicPlayer>(<MusicPlayer songs={TSongs} filterBy="originals" />);
    wrapper.instance().setState({ missionState: 'on', originalState: 'on' });
    wrapper.find('button.originalon').simulate('click');
    expect(wrapper.instance().state.originalState).toBe('off');
  });
  it('should resort songs', async () => {
    const wrapper = shallow<MusicPlayer>(<MusicPlayer songs={TSongs} filterBy="originals" />);
    const songs = [{
      _id: '123', url: 'yes.com', category: 'mission', title: 'A Song', year: 2000,
    }];
    const result = wrapper.instance().musicUtils.setIndex(songs, 'mission');
    expect(result).toBeTruthy();
  });
  it('allows click on share button', () => {
    const wrapper = shallow<MusicPlayer>(<MusicPlayer songs={TSongs} filterBy="originals" />);
    wrapper.instance().musicPlayerUtils.share = jest.fn();
    wrapper.update();
    const buttons = wrapper.instance().buttons();
    const renderButtons = shallow(buttons);
    renderButtons.find('button#share-button').simulate('click');
    expect(wrapper.instance().musicPlayerUtils.share).toHaveBeenCalled();
  });
  it('sets the index when missionState is off', async () => {
    const wrapper = shallow<MusicPlayer>(<MusicPlayer songs={TSongs} filterBy="originals" />);
    wrapper.instance().setState({
      player: {
        isShuffleOn: true, playing: true, shown: true, displayCopier: '', displayCopyMessage: false, onePlayerMode: false,
      },
      missionState: 'off',
    });
    wrapper.find('button.missionoff').simulate('click');
    wrapper.find('button#shuffle').simulate('click');
    const songsState = [{
      _id: '1234', url: 'test.com', category: 'original', title: 'A Test', year: 2009,
    }, {
      _id: '123', url: 'yes.com', category: 'mission', title: 'A Song', year: 2000,
    }];
    const reset = wrapper.instance().musicUtils.setIndex(songsState, 'mission');
    expect(reset[0].category).toBe('mission');
  });
  it('sets the index to be mission when pubState is off', async () => {
    const wrapper = shallow<MusicPlayer>(<MusicPlayer songs={TSongs} filterBy="originals" />);
    wrapper.instance().setState({
      player: {
        isShuffleOn: true, playing: true, shown: true, displayCopier: 'none', displayCopyMessage: false, onePlayerMode: false,
      },
      pubState: 'off',
    });
    wrapper.find('button.puboff').simulate('click');
    wrapper.find('button#shuffle').simulate('click');
    const songsState = [{
      _id: '1234', url: 'test.com', category: 'original', title: 'A Test', year: 2009,
    }, {
      _id: '123', url: 'yes.com', category: 'mission', title: 'A Song', year: 2000,
    }];
    const reset = wrapper.instance().musicUtils.setIndex(songsState, 'mission');
    expect(reset[0].category).toBe('mission');
  });
  it('checks if youtube is about to be played', () => {
    const song = {
      _id: '123', category: 'mission', title: 'Hey Red', url: 'https://www.youtube.com/embed/mCvUBjuzfo8', year: 2000,
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
      _id: '123', category: 'mission', title: 'lord', url: 'https://soundcloud.com/joshandmariamusic/ithelordofseaandskyhereiamlord', year: 2000,
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
      _id: '123', category: 'mission', title: 'Hey Red', url: 'something.test.com', year: 2000,
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
