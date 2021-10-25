/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { shallow } from 'enzyme';
import React from 'react';
import { SongEditor, onChangeSong } from '../../../src/components/SongEditor';

describe('SongEditor', () => {
  let editSong:any = {},
    auth:any = { token:'' };

  it('renders correctly in Create mode', () => {
    const wrapper = shallow(<SongEditor
      auth={auth}
    />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('h5').text()).toBe('Add Song');
  });
  it('onChangeSongs runs setNewEditor', ()=>{
    const setNewEditor = jest.fn();
    const evt:any = { persist:jest.fn(), target:{ id:'composer', value:'me' } };
    onChangeSong(evt, { image:{}, tour:{}, song:{} }, setNewEditor);
    expect(setNewEditor).toHaveBeenCalled();
  });
  // it('renders in Edit mode', () => {
  //   editSong = { _id: '123' };
  //   const wrapper = shallow(<SongEditor
  //     comp={comp}
  //     controller={controller}
  //   />);
  //   expect(wrapper.find('h5').text()).toBe('Edit Song');
  // });
});
