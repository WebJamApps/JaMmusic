/* eslint-disable @typescript-eslint/no-explicit-any */
import { shallow } from 'enzyme';

import renderer from 'react-test-renderer';
import { SongEditor, onChangeSong, makeInput, SongFormTitle, SongButtons, EditSongButtons, SongForm, 
  handleCategoryChange } from '../../../src/components/SongEditor';
import forms from '../../../src/lib/forms';

describe('SongEditor', () => {
  const auth:any = { token:'' };
  it('renders correctly', () => {
    const wrapper = shallow(<SongEditor
      auth={auth}
    />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('div.material-content.elevation3').exists()).toBe(true);
  });
  it('onChangeSongs runs setNewEditor', ()=>{
    const setNewEditor = jest.fn();
    const evt:any = { persist:jest.fn(), target:{ id:'composer', value:'me' } };
    onChangeSong(evt, { image:{}, tour:{}, song:{} }, setNewEditor);
    expect(setNewEditor).toHaveBeenCalled();
  });
  it('makeInput', ()=>{
    const onChangeMock = jest.fn();
    const props = { onChangeSong:onChangeMock, editor:{ song:{ title:'' } } };
    const input = renderer.create(makeInput(true, 'title', props)).root;
    input.findByType('input').props.onChange();
    expect(onChangeMock).toHaveBeenCalled();
  });
  it('SongFormTitle Edit', ()=>{
    const editor = { song:{ _id:'id' } };
    const songFormTitle = renderer.create(<SongFormTitle editor={editor}/>).root;
    expect(songFormTitle.findByType('h5').children[0]).toBe('Edit ');
  });
  it('SongFormTitle Create', ()=>{
    const editor = { song:{ } };
    const songFormTitle = renderer.create(<SongFormTitle editor={editor}/>).root;
    expect(songFormTitle.findByType('h5').children[0]).toBe('Add ');
  });
  it('SongButtons runs addSongAPI', ()=>{
    const song = { year:2021, category:'original', title:'title', url:'url', artist:'JaM' };
    const addSongAPI = jest.fn();
    const songButtons = renderer.create(<SongButtons editor={{ song, tour:{}, image:{} }} 
      setNewEditor={jest.fn()} auth={{}} addSongAPI={addSongAPI} updateSongAPI={jest.fn()}/>).root;
    songButtons.findByProps({ id:'add-song-button' }).props.onClick();
    expect(addSongAPI).toHaveBeenCalled();
  });
  it('SongButtons disables Add Song button', ()=>{
    const song = { year:2021, category:'', title:'title', url:'url' };
    const addSongAPI = jest.fn();
    const songButtons = renderer.create(<SongButtons editor={{ song, tour:{}, image:{} }} 
      setNewEditor={jest.fn()} auth={{}} addSongAPI={addSongAPI} updateSongAPI={jest.fn()}/>).root;
    expect(songButtons.findByProps({ id:'add-song-button' }).props.disabled).toBe(true);
  });
  it('SongButtons runs updateSongAPI', ()=>{
    const song = { year:2021, category:'original', title:'title', url:'url', _id:'123' };
    const updateSongAPI = jest.fn();
    const songButtons = renderer.create(<SongButtons editor={{ song, tour:{}, image:{} }} 
      setNewEditor={jest.fn()} auth={{}} addSongAPI={jest.fn()} updateSongAPI={updateSongAPI}/>).root;
    songButtons.findByProps({ id:'update-song-button' }).props.onClick();
    expect(updateSongAPI).toHaveBeenCalled();
  });
  it('EditSongButtons click Cancel button', ()=>{
    const setNewEditor = jest.fn();
    const song = { year:2021, category:'original', title:'title', url:'url', _id:'123' };
    const editSongButtons = renderer.create(<EditSongButtons setNewEditor={setNewEditor} 
      updateSongAPI={jest.fn()} auth={{}} editor={{ song, tour:{}, image:{} }}/>).root; 
    editSongButtons.findByProps({ id:'cancel-edit-song' }).props.onClick();
    expect(setNewEditor).toHaveBeenCalled();
  });
  it('SongForm handleCategoryChange', ()=>{
    const editor = { song:{} };
    const setNewEditor = jest.fn();
    const handleCatChange = jest.fn();
    const evt:any = { target:{ value:'test' } };
    const songForm = renderer.create(<SongForm forms={forms} editor={editor} setNewEditor={setNewEditor} 
      onChangeSong={jest.fn()} handleCategoryChange={handleCatChange}/>).root; 
    songForm.findByProps({ id:'category' }).props.onChange(evt);
    expect(handleCatChange).toHaveBeenCalled();
  });
  it('handleCategoryChange', ()=>{
    const setNewEditor = jest.fn();
    const evt:any = { target:{ value:'test' } };
    handleCategoryChange(evt, { song:{} }, setNewEditor);
    expect(setNewEditor).toHaveBeenCalled();
  });
});
