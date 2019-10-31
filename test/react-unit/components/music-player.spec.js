import React from 'react';
import { mount, shallow } from 'enzyme';
import { MusicPlayer } from '../../../src/components/MusicPlayer';
import songData from '../../../src/App/songs.json';

function setup() {
  const { songs } = songData;

  window.document.body.innerHTML = '<div id="sidebar"></div><div id="header"/><div id="contentBlock"/>'
    + '<div id="wjfooter"/><div id="mobilemenutoggle"/><div id="pageContent"/><h4 id="headerTitle">'
    + '<div id="mainPlayer"/>';

  const wrapper = mount(<MusicPlayer songs={songs} filterBy="originals" />, {
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
    wrapper.setState({ player: { playing: false, isShuffleOn: false, onePlayerMode: true } });
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
    mp.state = {
      song: { _id: '789' }, songsState: [{ _id: '123' }, { _id: '456' }], copy: [{ _id: '123' }, { _id: '456' }], player: { isShuffleOn: false },
    };
    mp.setState = (obj) => { expect(obj.song._id).not.toBe('789'); };
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
      index: 0, songsState: [{ _id: '123' }, { _id: '456' }], copy: [{ _id: '123' }, { _id: '456' }], player: { isShuffleOn: false },
    };
    mp.setState = (obj) => { expect(obj.index).toBe(1); };
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
  it('hides copier message after showing for 1.5s', () => new Promise((done) => {
    const { wrapper } = setup();
    wrapper.instance().navigator = { clipboard: { async writeText(arg) { return arg; } } };
    wrapper.update();
    wrapper.instance().musicPlayerUtils.copyShare(wrapper.instance());
    expect(wrapper.instance().state.player.displayCopier).toBe('none');
    setTimeout(() => done(), 1501);
  }));
  it('toggles off copying/share pane', () => {
    const { wrapper } = setup();
    wrapper.instance().setState({ player: { displayCopier: 'block' } });
    wrapper.instance().musicPlayerUtils.share(wrapper.instance());
    expect(wrapper.instance().state.player.displayCopier).toBe('none');
  });
  it('toggles on copying/share pane', () => {
    const { wrapper } = setup();
    wrapper.instance().setState({ player: { displayCopier: 'none' } });
    wrapper.instance().musicPlayerUtils.share(wrapper.instance());
    expect(wrapper.instance().state.player.displayCopier).toBe('block');
  });
  it('returns a null playUrl', () => new Promise((done) => {
    const { wrapper } = setup();
    wrapper.instance().setState({ song: null });
    const result = wrapper.instance().playUrl();
    expect(result).toBe(null);
    done();
  }));
  it('turns off the pic slider before unmounting', () => new Promise((done) => {
    const { wrapper } = setup();
    wrapper.instance().setState = jest.fn((obj) => {
      expect(obj.slider).toBe(false);
    });
    wrapper.update();
    wrapper.unmount();
    done();
  }));
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
  it('should resort songs', async () => {
    const { wrapper } = setup();
    const songs = ['mission'];
    const result = await wrapper.instance().setIndex(songs);
    expect(result).toBeTruthy();
  });
  it('allows click on share button', () => new Promise((done) => {
    const { wrapper } = setup();
    wrapper.instance().musicPlayerUtils.share = jest.fn();
    wrapper.update();
    const buttons = wrapper.instance().buttons();
    const renderButtons = shallow(buttons);
    renderButtons.find('button#share-button').simulate('click');
    expect(wrapper.instance().musicPlayerUtils.share).toHaveBeenCalled();
    done();
  }));
});
