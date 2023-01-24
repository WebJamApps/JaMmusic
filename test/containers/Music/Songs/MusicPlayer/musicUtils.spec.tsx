import musicUtils from 'src/containers/Songs/MusicPlayer/utils';
import TSongs from 'test/testSongs';

describe('musicUtils', () => {
  // it('makes text under player when empty song object', () => {
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   const song:any = {};
  //   const result = musicUtils.textUnderPlayer(song);
  //   expect(result).toBeDefined();
  // });
  it('setIndex', () => {
    const result = musicUtils.setIndex(TSongs, 'Original');
    expect(result.length).toBeGreaterThan(0);
  });
});
