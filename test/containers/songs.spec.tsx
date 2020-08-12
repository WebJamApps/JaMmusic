import React from 'react';
import { shallow } from 'enzyme';
import { Songs } from '../../src/containers/Songs';
import DefaultMusicPlayer from '../../src/components/MusicPlayer';

function setup() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const songs:any[] = [{ url: '', category: 'originals' }, { url: '', category: 'originals' }];
  const wrapper = shallow<Songs>(<Songs songs={songs} />);
  return { wrapper };
}

describe('Songs component', () => {
  it('renders the Original component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('div.page-content').exists()).toBe(true);
  });

  it('expect the presence of Music player', () => {
    const { wrapper } = setup();
    expect(wrapper.find(DefaultMusicPlayer).exists()).toBe(true);
  });
  it('should not display the music player', () => new Promise((done) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const songs:any[] = [];
    const wrapper = shallow(<Songs songs={songs} />);
    expect(wrapper.find(DefaultMusicPlayer).exists()).toBe(false);
    done();
  }));
});
