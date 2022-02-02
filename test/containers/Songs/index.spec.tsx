
import { shallow } from 'enzyme';
import { Songs } from '../../../src/containers/Songs';
import DefaultMusicPlayer from '../../../src/components/MusicPlayer';
import DPlayer from '../../../src/containers/Songs/Player';

function setup() {
  const wrapper = shallow<Songs>(<Songs />);
  return { wrapper };
}

describe('Songs component', () => {
  it('renders the Original component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('div.page-content').exists()).toBe(true);
  });

  it('expect the presence of Music player', () => {
    const { wrapper } = setup();
    expect(wrapper.find(DPlayer).dive().find('div.playerDiv').exists()).toBe(true);
  });
  it('should not display the music player', () => {
    const wrapper = shallow(<Songs />);
    expect(wrapper.find(DefaultMusicPlayer).exists()).toBe(false);
  });
});
