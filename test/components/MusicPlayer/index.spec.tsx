
import { MusicPlayer } from 'src/components/MusicPlayer';
import TSongs from '../../testSongs';

describe('Music player component init', () => {
  it('is defined', () => {
    expect(MusicPlayer).toBeDefined();
    expect(TSongs).toBeDefined();
  });
});
