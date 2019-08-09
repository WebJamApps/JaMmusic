import React from 'react';
import { shallow } from 'enzyme';
import { Originals } from '../../src/containers/Originals';
// import { MusicPlayer } from '../../src/components/MusicPlayer';

function setup() {
  const props = { songs: [{ url: '', category: 'originals' }] };

  const wrapper = shallow(<Originals {...props} />);
  return { wrapper, props };
}

describe('Original Music component init', () => {
  it('renders the Original component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('div.page-content').exists()).toBe(true);
  });

  // it('expect the presence of Music player', () => {
  //   const { wrapper } = setup();
  //   expect(wrapper.find(MusicPlayer).exists()).toBe(true);
  // });

  // it('should simulate a click on adding mission/pub song types when either is off', () => {
  //   const { wrapper } = setup();
  //   wrapper.instance().ToggleSongTypes('pub')();
  //   expect(wrapper.instance().state.pubState).toBe('on');
  // });

  // it('should simulate a click on adding mission/pub song types when either is on', () => {
  //   const { wrapper } = setup();
  //   wrapper.instance().setState({ missionState: 'on' });
  //   wrapper.instance().ToggleSongTypes('mission')();
  //   expect(wrapper.instance().state.missionState).toBe('off');
  // });

  // it('should resort songs', async () => {
  //   const { wrapper } = setup();
  //   const songs = ['mission'];
  //   const result = await wrapper.instance().setIndex(songs);
  //   expect(result).toBeTruthy();
  // });

  // it('should populate songs with originals when component will be mounted with less than 2 songs', async () => {
  //   const { wrapper } = setup();
  //   wrapper.instance().setState({ songs: [] });
  //
  //   const populateRes = await wrapper.instance().componentWillMount();
  //
  //   expect(populateRes).toBeTruthy();
  // });
});
