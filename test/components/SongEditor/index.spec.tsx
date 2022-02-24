/* eslint-disable @typescript-eslint/no-explicit-any */
// import { shallow } from 'enzyme';

import renderer from 'react-test-renderer';
import { EditorProvider } from 'src/providers/Editor.provider';
import {
  SongEditor, onChangeSong, makeInput, SongFormTitle, SongButtons, EditSongButtons, SongForm,
  handleCategoryChange,
} from '../../../src/components/SongEditor';
// import forms from '../../../src/lib/forms';

describe('SongEditor', () => {
  it('renders correctly', () => {
    const auth: any = { token: '' };
    const songEditor = renderer.create(<EditorProvider><SongEditor auth={auth} /></EditorProvider>).toJSON();
    expect(songEditor).toMatchSnapshot();
  });
  it('renders correctly when song category is missing', () => {
    const auth: any = { token: '' };
    const songEditor: any = renderer.create(<EditorProvider><SongEditor auth={auth} /></EditorProvider>).toJSON();
    expect(songEditor.props.className.includes('material-content')).toBe(true);
  });
  it('onChangeSongs runs setNewEditor', () => {
    const setNewEditor = jest.fn();
    const evt: any = { persist: jest.fn(), target: { id: 'composer', value: 'me' } };
    onChangeSong(evt, { image: {}, tour: {}, song: { category: '', year: 0, title: '', url: '' } }, setNewEditor);
    expect(setNewEditor).toHaveBeenCalled();
  });
  it('makeInput', () => {
    const onChangeMock = jest.fn();
    const editorContext = { setNewEditor: onChangeMock, editor: { song: { category: '', year: 0, title: '', url: '' }, tour: {}, image: {} } };
    const input = renderer.create(makeInput(true, 'title', editorContext)).root;
    input.findByType('input').props.onChange({ persist: jest.fn(), target: { id: '', value: '' } });
    expect(onChangeMock).toHaveBeenCalled();
  });
  it('SongFormTitle Edit', () => {
    const editor = { song: { _id: 'id', category: 'original', year: 2020, title: '', url: '' }, tour: {}, image: {} };
    const songFormTitle = renderer.create(<SongFormTitle editor={editor} />).root;
    expect(songFormTitle.findByType('h5').children[0]).toBe('Edit ');
  });
  it('SongFormTitle Create', () => {
    const editor = { song: { category: 'original', year: 2020, title: '', url: '' }, tour: {}, image: {} };
    const songFormTitle = renderer.create(<SongFormTitle editor={editor} />).root;
    expect(songFormTitle.findByType('h5').children[0]).toBe('Add ');
  });
  it('SongButtons runs addSongAPI', () => {
    const song = { year: 2021, category: 'original', title: 'title', url: 'url', artist: 'JaM' };
    const addSongAPI = jest.fn();
    const songButtons = renderer.create(<SongButtons editor={{ song, tour: {}, image: {} }}
      setNewEditor={jest.fn()} auth={{}} addSongAPI={addSongAPI} updateSongAPI={jest.fn()} />).root;
    songButtons.findByProps({ id: 'add-song-button' }).props.onClick();
    expect(addSongAPI).toHaveBeenCalled();
  });
  it('SongButtons disables Add Song button', () => {
    const song = { year: 2021, category: '', title: 'title', url: 'url' };
    const addSongAPI = jest.fn();
    const songButtons = renderer.create(<SongButtons editor={{ song, tour: {}, image: {} }}
      setNewEditor={jest.fn()} auth={{}} addSongAPI={addSongAPI} updateSongAPI={jest.fn()} />).root;
    expect(songButtons.findByProps({ id: 'add-song-button' }).props.disabled).toBe(true);
  });
  it('SongButtons runs updateSongAPI', () => {
    const song = { year: 2021, category: 'original', title: 'title', url: 'url', _id: '123' };
    const updateSongAPI = jest.fn();
    const songButtons = renderer.create(<SongButtons editor={{ song, tour: {}, image: {} }}
      setNewEditor={jest.fn()} auth={{}} addSongAPI={jest.fn()} updateSongAPI={updateSongAPI} />).root;
    songButtons.findByProps({ id: 'update-song-button' }).props.onClick();
    expect(updateSongAPI).toHaveBeenCalled();
  });
  it('EditSongButtons click Cancel button', () => {
    const setNewEditor = jest.fn();
    const song = { year: 2021, category: 'original', title: 'title', url: 'url', _id: '123' };
    const editSongButtons = renderer.create(<EditSongButtons setNewEditor={setNewEditor}
      updateSongAPI={jest.fn()} auth={{}} editor={{ song, tour: {}, image: {} }} />).root;
    editSongButtons.findByProps({ id: 'cancel-edit-song' }).props.onClick();
    expect(setNewEditor).toHaveBeenCalled();
  });
  it('SongForm handleCategoryChange', () => {
    const editor = { song: { category: 'original', year: 2020, title: '', url: '' }, tour: {}, image: {} };
    const setNewEditor = jest.fn();
    const evt: any = { target: { value: 'test' } };
    const songForm = renderer.create(<SongForm editor={editor} setNewEditor={setNewEditor}
    />).root;
    songForm.findByProps({ id: 'category' }).props.onChange(evt);
    expect(setNewEditor).toHaveBeenCalled();
  });
  it('handleCategoryChange', () => {
    const setNewEditor = jest.fn();
    const evt: any = { target: { value: 'test' } };
    handleCategoryChange(evt, { song: { category: '', year: 0, title: '', url: '' }, tour: {}, image: {} }, setNewEditor);
    expect(setNewEditor).toHaveBeenCalled();
  });
});
