import musicUtils from '../../../src/components/MusicPlayer/musicUtils';

describe('musicUtils', () => {
  it('makes text under player when empty song object', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const song:any = {};
    const result = musicUtils.textUnderPlayer(song);
    expect(result).toBeDefined();
  });
});
