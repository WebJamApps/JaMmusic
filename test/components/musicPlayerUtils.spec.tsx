import { shallow } from 'enzyme';
import musicPlayerUtils from '../../src/components/MusicPlayer/musicPlayerUtils';

describe('musicPlayerUtils', () => {
  beforeEach(() => {
    document.body.innerHTML = "<div id='sidebar'></div> <div id='header'></div><div id='wjfooter'></div><div id='mobilemenutoggle'></div>"
    + "<div id='contentBlock'></div><div id='pageContent'></div><div id='headerTitle'></div><div id='mainPlayer'><div id='mAndP'></div></div>";
  });
  const params = {
    get: (item) => { // eslint-disable-line consistent-return
      if (item === 'oneplayer') return true;
      if (item === 'id') return '123' || '456';
    },
  };
  const controller = {
    setState: () => true,
    props: { songs: [{ _id: '123' }] },
    state: {
      songsState: [], player: { onePlayerMode: true, isShuffleOn: true }, pageTitle: '', missionState: '',
    },
  };
  it('checks for one player then sets the song', async () => {
    const result = await musicPlayerUtils.checkOnePlayer(params, { onePlayerMode: false }, controller);
    expect(result).toBe(true);
  });
  it('checks for one player then sets the song when the id does not match', async () => {
    params.get = (item) => { // eslint-disable-line consistent-return
      if (item === 'oneplayer') return true;
      if (item === 'id') return '456';
    };
    const result = await musicPlayerUtils.checkOnePlayer(params, { onePlayerMode: false }, controller);
    expect(result).toBe(true);
  });

  it('makes one player', () => {
    const result = musicPlayerUtils.makeOnePlayerMode();
    expect(result).toBe(true);
  });
  it('makes one player and adjusts height for smaller devices', () => {
    Object.defineProperty(window, 'outerWidth', { writable: true, configurable: true, value: 500 });
    const result = musicPlayerUtils.makeOnePlayerMode();
    expect(result).toBe(true);
  });

  it('checks for null styles', () => {
    document.body.innerHTML = '';
    Object.defineProperty(window, 'outerWidth', { writable: true, configurable: true, value: 400 });
    const result = musicPlayerUtils.makeOnePlayerMode();
    expect(result).toBe(true);
  });

  it('runs one player mode if it exists', () => {
    Object.defineProperty(window, 'outerWidth', { writable: true, configurable: true, value: 800 });
    const result = musicPlayerUtils.runIfOnePlayer(controller);
    expect(result).toBe(true);
  });
  it('makes the home button that navigates to /music page', () => {
    const wrapper = shallow(musicPlayerUtils.homeButton(true));
    Object.defineProperty(window, 'location', { value: { href: '/booya', assign: () => {}, reload: () => {} }, writable: true });
    window.location.assign = jest.fn();
    wrapper.find('button').simulate('click');
    expect(window.location.assign).toHaveBeenCalled();
  });
  it('hides the mission and pub buttons', () => {
    musicPlayerUtils.showHideButtons('none');
    expect(document.getElementById('mAndP').style.display).toBe('none');
  });
  it('hides the home button', () => {
    const wrapper = shallow(musicPlayerUtils.homeButton(false));
    expect(wrapper.find('button').length).toBe(1);
  });
  it('does nothing to the mission and pub buttons when they do not exist', () => {
    document.body.innerHTML = '';
    const result = musicPlayerUtils.showHideButtons('none');
    expect(result).toBe(false);
  });
  it('reshuffled the songs if shuffle is on and type is deselected', () => {
    // @ts-ignore
    controller.setState = (obj) => {
      expect(obj.player.isShuffleOn).toBe(true);
    };
    controller.state.player.isShuffleOn = true;
    controller.state.missionState = 'on';
    musicPlayerUtils.toggleSongTypes('mission', controller);
  });
});
