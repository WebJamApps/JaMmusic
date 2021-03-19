/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { shallow } from 'enzyme';
import React from 'react';
import SongEditor from '../../../src/components/SongEditor';

describe('SongEditor', () => {
  let editSong:any = {}, songState:any = {},
    comp:any = {}, controller:any = { forms: { makeDropdown: jest.fn() } };

  it('renders correctly in Create mode', () => {
    const wrapper = shallow(<SongEditor
      editSong={editSong}
      songState={songState}
      comp={comp}
      controller={controller}
    />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('h5').text()).toBe('Add Song');
  });
  it('renders in Edit mode', () => {
    editSong = { _id: '123' };
    const wrapper = shallow(<SongEditor
      editSong={editSong}
      songState={songState}
      comp={comp}
      controller={controller}
    />);
    expect(wrapper.find('h5').text()).toBe('Edit Song');
  });
});
