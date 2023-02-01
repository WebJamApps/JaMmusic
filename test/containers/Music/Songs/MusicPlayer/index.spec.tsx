
import { MusicPlayer } from 'src/containers/Songs/MusicPlayer';
import renderer from 'react-test-renderer';
import TSongs from 'test/testSongs';
import { BrowserRouter } from 'react-router-dom';

describe('MusicPlayer index', () => {
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
    const mp:any = renderer.create(
      <BrowserRouter>
        <MusicPlayer songs={[song]} filterBy="originals" />
      </BrowserRouter>,
    ).toJSON();
    expect(mp.props.className).toBe('container-fluid');
  });
});
