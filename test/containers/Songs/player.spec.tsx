
import { shallow } from 'enzyme';
import DPlayer from '../../../src/containers/Songs/Player';
import DefaultMusicPlayer from '../../../src/components/MusicPlayer';
import TSongs from '../../testSongs';

describe('player', () => {
  it('renders the react music player when there are real songs', () => {
    const wrapper = shallow(<DPlayer songArr={TSongs} />);
    expect(wrapper.find(DefaultMusicPlayer).exists()).toBe(true);
  });
});
