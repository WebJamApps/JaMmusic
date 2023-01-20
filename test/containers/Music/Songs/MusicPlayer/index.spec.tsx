
import { MusicPlayer } from 'src/containers/Songs/MusicPlayer';
import renderer from 'react-test-renderer';
import TSongs from 'test/testSongs';

describe('Music player component init', () => {
  it('is defined', () => {
    expect(MusicPlayer).toBeDefined();
    expect(TSongs).toBeDefined();
  });
  it('renders', () => {
    const song = {
      category: 'original',
      year: 2020,
      title: 'title',
      url: 'url',
      _id: 'songid',
    };
    const mp:any = renderer.create(<MusicPlayer songs={[song]} filterBy="originals" />).toJSON();
    expect(mp.props.className).toBe('container-fluid');
  });
});
