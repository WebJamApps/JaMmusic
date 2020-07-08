import musicUtils from '../../../src/components/MusicPlayer/musicUtils';

describe('musicUtils', () => {
  it('makes text under player when null song', () => {
    const result = musicUtils.textUnderPlayer(null);
    expect(result).toBeDefined();
  });
});
