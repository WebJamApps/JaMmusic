import utils from 'src/containers/Songs/MusicPlayer/utils';
import commonUtils from 'src/lib/utils';
import type { Isong } from 'src/providers/Data.provider';
import TestSongs from '../../../testSongs';

describe('MusicPlayer/utils', () => {
  it('handlePlayerReady', () => {
    expect(utils.handlePlayerReady('player' as any)).toBe('player');
  });
  it('handlePlayerError', () => {
    expect(utils.handlePlayerError('error' as any)).toBe('error');
  });
  it('prev when index is 0', () => {
    const setIndex = jest.fn();
    utils.prev(0, TestSongs, setIndex);
    expect(setIndex).toHaveBeenCalledWith(3);
  });
  it('prev when index is 3', () => {
    const setIndex = jest.fn();
    utils.prev(3, TestSongs, setIndex);
    expect(setIndex).toHaveBeenCalledWith(2);
  });
  it('next when index is 0', () => {
    const setIndex = jest.fn();
    utils.next(0, TestSongs, setIndex);
    expect(setIndex).toHaveBeenCalledWith(1);
  });
  it('next when index is 3', () => {
    const setIndex = jest.fn();
    utils.next(3, TestSongs, setIndex);
    expect(setIndex).toHaveBeenCalledWith(0);
  });
  it('play', () => {
    const setPlaying = jest.fn();
    utils.play(true, setPlaying);
    expect(setPlaying).toHaveBeenCalledWith(false);
  });
  it('makeSingleSong', () => {
    expect(utils.makeSingleSong(true)).toBe(true);
  });
  it('setPlayerStyle with empty background', () => {
    const song = {
      artist: '',
      category: '',
      year: 2023,
      title: '',
      url: 'https://ssssyyyy.com/song.mp3',
    };
    const playerStyle = {
      backgroundImage: '',
      backgroundColor: '#eee',
      textAlign: 'center',
      backgroundPosition: 'center',
      backgroundSize: '80%',
      backgroundRepeat: 'no-repeat',
    };
    const newPlayerStyle = utils.setPlayerStyle(song);
    expect(newPlayerStyle).toEqual(playerStyle);
  });
  it('copy song URL and show notification', () => {
    const elemDiv = document.createElement('input');
    elemDiv.id = 'copyUrl';
    elemDiv.value = 'https://test.com';
    document.body.appendChild(elemDiv);
    commonUtils.notify = jest.fn();
    const writeText = jest.fn();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, writable: true });
    utils.copyShare();
    expect(commonUtils.notify).toHaveBeenCalled();
    expect(writeText).toHaveBeenCalledWith('https://test.com');
  });
  it('sets styles for setSingleDisplays', () => {
    const elements = {
      sidebar: { style: { display: '' } },
      header: { style: { display: '' } },
      footer: { style: { display: '' } },
      toggler: { style: { display: '' } },
      contentBlock: {
        style: {
          overflowY: 'auto', width: '100%', height: '100%', marginTop: '0px',
        },
      },
      pageContent: { style: { borderColor: '#fff' } },
      headerTitle: { style: { display: '' } },
      mainPlayer: { style: { height: '55vh' } },
      outerWidth: 599,
    };
    utils.setSingleDisplays(elements);
    expect(elements.sidebar.style.display).toBe('none');
    expect(elements.header.style.display).toBe('none');
    expect(elements.footer.style.display).toBe('none');
    expect(elements.toggler.style.display).toBe('none');
    expect(elements.headerTitle.style.display).toBe('none');
    expect(elements.contentBlock.style.overflowY).toBe('auto');
    expect(elements.contentBlock.style.width).toBe('100%');
    expect(elements.contentBlock.style.height).toBe('100%');
    expect(elements.contentBlock.style.marginTop).toBe('0px');
    expect(elements.mainPlayer.style.height).toBe('55vh');
    expect(elements.pageContent.style.borderColor).toBe('#fff');
  });
  it('setIsSingle, setIndex, newSongs', () => {
    const search: any = { get: () => '' };
    const songs = [
      {
        category: '1', _id: 'string1', title: 'a', year: 23, url: 'https//:test1.com',
      },
      {
        category: '2', _id: 'string2', title: 'b', year: 22, url: 'https//:test2.com',
      },
      {
        category: '3', _id: 'string3', title: 'c', year: 21, url: 'https//:test3.com',
      },
    ] as Isong[];
    const category = '';
    const setters = { setSongsState: jest.fn(), setIndex: jest.fn(), setIsSingle: jest.fn() };
    utils.initSongs(songs, category, search, setters);
    expect(setters.setIsSingle).toHaveBeenCalledWith(true);
  });
});
