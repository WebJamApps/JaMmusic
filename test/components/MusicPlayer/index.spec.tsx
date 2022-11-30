
import { MusicPlayer } from 'src/components/MusicPlayer';
import renderer from 'react-test-renderer';
import TSongs from '../../testSongs';

describe('Music player component init', () => {
  it('is defined', () => {
    expect(MusicPlayer).toBeDefined();
    expect(TSongs).toBeDefined();
  });
  it('renders', () => {
    const mp:any = renderer.create(<MusicPlayer songs={[]} filterBy="originals" />).toJSON();
    expect(mp.props.className).toBe('container-fluid');
  });
});
