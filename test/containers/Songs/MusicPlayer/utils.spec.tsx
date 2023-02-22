import utils from 'src/containers/Songs/MusicPlayer/utils';
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
});
