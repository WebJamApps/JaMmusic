/* eslint-disable @typescript-eslint/no-explicit-any */
import renderer from 'react-test-renderer';
import { defaultSong, EditorProvider } from 'src/providers/Editor.provider';
import type { Auth } from 'src/redux/mapStoreToProps';
import {
  SongEditor, onChangeSong, SongFormTitle, SongButtons, EditSongButtons, SongForm,
  handleCategoryChange, SongInput, validateSongInput,
} from 'src/components/SongEditor';
import utils from 'src/components/SongEditor/songEditorUtils';

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
    onChangeSong(evt, {
      image: {}, tour: {}, song: { ...defaultSong, _id: 'adls;kjf' }, isValid: true, hasChanged: true,
    }, setNewEditor);
    expect(setNewEditor).toHaveBeenCalled();
  });
  it('SongFormTitle Edit', () => {
    const editor = {
      hasChanged: false, isValid: true, song: { ...defaultSong, _id: 'adls;kjf' }, tour: {}, image: {},
    };
    const songFormTitle = renderer.create(<SongFormTitle editor={editor} />).root;
    expect(songFormTitle.findByType('h5').children[0]).toBe('Edit ');
  });
  it('SongFormTitle Create', () => {
    const editor = {
      song: defaultSong, tour: {}, image: {}, hasChanged: false, isValid: true,
    };
    const songFormTitle = renderer.create(<SongFormTitle editor={editor} />).root;
    expect(songFormTitle.findByType('h5').children[0]).toBe('Add ');
  });
  it('SongButtons runs addSongAPI', () => {
    const song = {
      year: 2021, category: 'original', title: 'title', url: 'url', artist: 'JaM',
    };
    utils.addSongAPI = jest.fn();
    const songButtons = renderer.create(<SongButtons
      editor={{
        song, tour: {}, image: {}, isValid: true, hasChanged: true,
      }}
      setEditor={jest.fn()}
      auth={{} as Auth}
    />).root;
    songButtons.findByProps({ id: 'add-song-button' }).props.onClick();
    expect(utils.addSongAPI).toHaveBeenCalled();
  });
  it('SongButtons disables Add Song button', () => {
    const song = {
      year: 2021, category: '', title: 'title', url: 'url',
    };
    const songButtons = renderer.create(<SongButtons
      editor={{
        song, tour: {}, image: {}, isValid: true, hasChanged: true,
      }}
      setEditor={jest.fn()}
      auth={{} as Auth}
    />).root;
    expect(songButtons.findByProps({ id: 'add-song-button' }).props.disabled).toBe(true);
  });
  it('SongButtons runs updateSongAPI', () => {
    const song = {
      year: 2021, category: 'original', title: 'title', url: 'url', _id: '123',
    };
    utils.updateSongAPI = jest.fn();
    const songButtons = renderer.create(<SongButtons
      editor={{
        song, tour: {}, image: {}, isValid: true, hasChanged: true,
      }}
      setEditor={jest.fn()}
      auth={{} as Auth}
    />).root;
    songButtons.findByProps({ id: 'update-song-button' }).props.onClick();
    expect(utils.updateSongAPI).toHaveBeenCalled();
  });
  it('EditSongButtons click Cancel button', () => {
    const setNewEditor = jest.fn();
    const song = {
      year: 2021, category: 'original', title: 'title', url: 'url', _id: '123',
    };
    const editSongButtons = renderer.create(<EditSongButtons
      setEditor={setNewEditor}
      setSongs={jest.fn()}
      auth={{} as Auth}
      editor={{
        song, tour: {}, image: {}, isValid: true, hasChanged: true,
      }}
    />).root;
    editSongButtons.findByProps({ id: 'cancel-edit-song' }).props.onClick();
    expect(setNewEditor).toHaveBeenCalled();
  });
  it('SongForm handleCategoryChange', () => {
    const editor = {
      isValid: true,
      hasChanged: true,
      song: {
        category: 'original', year: 2020, title: '', url: '',
      },
      tour: {},
      image: {},
    };
    const setNewEditor = jest.fn();
    const evt: any = { target: { value: 'test' } };
    const songForm = renderer.create(<SongForm
      editor={editor}
      setEditor={setNewEditor}
    />).root;
    songForm.findByProps({ id: 'category' }).props.onChange(evt);
    expect(setNewEditor).toHaveBeenCalled();
  });
  it('handleCategoryChange', () => {
    const setNewEditor = jest.fn();
    const evt: any = { target: { value: 'test' } };
    handleCategoryChange(evt, {
      isValid: true,
      hasChanged: true,
      song: {
        category: '', year: 0, title: '', url: '',
      },
      tour: {},
      image: {},
    }, setNewEditor);
    expect(setNewEditor).toHaveBeenCalled();
  });
  it('renders SongInput and handles onChange', () => {
    const props = {
      required: true, id: 'id', editor: { song: { id: 'id' } } as any, setEditor: jest.fn(),
    };
    const songInput = renderer.create(<SongInput {...props} />).root;
    songInput.findByType('input').props.onChange({ persist: jest.fn(), target: { id: 'id', value: 'value' } });
    expect(props.setEditor).toHaveBeenCalled();
  });
  it('validateSongInput for artist', () => {
    expect(validateSongInput('artist', '')).toBe(false);
  });
  it('validateSongInput for url', () => {
    expect(validateSongInput('url', '')).toBe(false);
  });
  it('validateSongInput for year', () => {
    expect(validateSongInput('year', '10')).toBe(false);
  });
});
