import musicUtils from '../../../src/components/MusicPlayer/musicUtils';

describe('musicUtils', () => {
  it('makes text under player when empty song object', () => {
    const song:any = {};
    const result = musicUtils.textUnderPlayer(song);
    expect(result).toBeDefined();
  });
});
