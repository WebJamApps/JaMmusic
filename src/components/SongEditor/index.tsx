
import React from 'react';
import forms from '../../lib/forms';
import superagent from 'superagent';
import songEditorUtils from './songEditorUtils';
import { EditorContext } from '../../providers/Editor.provider';
import type { ISong } from '../../providers/Songs.provider';

interface Ieditor { song: ISong; tour: Record<string, unknown>; image: Record<string, unknown>; }

export const onChangeSong = (evt: React.ChangeEvent<HTMLInputElement>, editor: Ieditor,
  setNewEditor: (arg0: Ieditor) => void): void => {
  evt.persist();
  const newEditor = { image: {}, tour: {}, song: { ...editor.song, [evt.target.id]: evt.target.value } };
  setNewEditor(newEditor);
};

export const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>, editor: Ieditor,
  setNewEditor: (arg0: Ieditor) => void): void => {
  setNewEditor({ image: {}, tour: {}, song: { ...editor.song, category: event.target.value } });
};

export const makeInput = (required: boolean, id: string,
  editorContext: {
    editor: Ieditor,
    setNewEditor: (arg0: Ieditor) => void
  }): JSX.Element => {
  const { editor, setNewEditor } = editorContext;
  const { song } = editor;
  const songValue: any = song;
  // eslint-disable-next-line security/detect-object-injection
  const inputValue = songValue[id] || '';
  return (<label htmlFor={id}>
    {required ? '* ' : ''}{id}
    <input id={id} value={inputValue} onChange={(evt) => onChangeSong(evt, editor, setNewEditor)} />
  </label>
  );
};

export const MoreSongForm = (props: {
  setNewEditor: (arg0: Ieditor) => void,
  editor: Ieditor,
  onChangeSong: any
}): JSX.Element => {
  return (
    <>
      {makeInput(false, 'album', props)}
      {makeInput(false, 'image', props)}
      {makeInput(false, 'composer', props)}
      {makeInput(true, 'year', props)}
    </>
  );
};

interface IsongFormProps {
  editor: Ieditor,
  setNewEditor: (arg0: Ieditor) => void
}
export const SongForm = (props: IsongFormProps): JSX.Element => {
  const { editor, setNewEditor } = props;
  return (
    <>
      {makeInput(true, 'title', props)}
      {makeInput(true, 'url', props)}
      {makeInput(true, 'artist', props)}
      <p>* Category</p>
      {forms.makeDropdown('category', editor.song.category,
        (evt: React.ChangeEvent<HTMLSelectElement>) => handleCategoryChange(evt,
          editor, setNewEditor), ['original', 'mission', 'pub'])}
      <MoreSongForm setNewEditor={setNewEditor} editor={editor} onChangeSong={onChangeSong} />
    </>
  );
};

export const EditSongButtons = ({ setNewEditor, editor, auth, updateSongAPI }:
{
  setNewEditor: (arg0: Ieditor) => void,
  editor: Ieditor,
  auth: any, updateSongAPI: any
}): JSX.Element => {
  return (
    <span>
      <button className="floatRight" type="button" id="cancel-edit-song"
        onClick={() => setNewEditor({ song: { category: 'original', year: 2022, title: '', url: '' }, tour: {}, image: {} })}>
        Cancel
      </button>
      <button
        className=""
        id="update-song-button"
        type="button"
        onClick={() => updateSongAPI(superagent, editor.song, auth, setNewEditor)}
      >
        Update
        {' '}
        Song
      </button>
    </span>
  );
};

interface IsongButtonsProps {
  setNewEditor: (arg0: Ieditor) => void, editor: Ieditor,
  auth: any, addSongAPI: any, updateSongAPI: any
}
export const SongButtons = ({ editor, setNewEditor, auth, addSongAPI, updateSongAPI }:
IsongButtonsProps): JSX.Element => {
  return (
    <div style={{ textAlign: 'left', marginTop: '10px' }}>
      <span style={{
        fontSize: '16px', marginRight: '20px', position: 'relative', display: 'inline-block',
      }}
      >
        <i>* Required</i>
      </span>
      {editor.song._id ? <EditSongButtons editor={editor} setNewEditor={setNewEditor} auth={auth} updateSongAPI={updateSongAPI} /> :
        <button
          id="add-song-button"
          disabled={!(editor.song.year && editor.song.title && editor.song.url && editor.song.artist)}
          type="button"
          onClick={() => addSongAPI(superagent, editor.song, auth, setNewEditor)}
        >
          Add Song
        </button>
      }
    </div>
  );
};

export const SongFormTitle = ({ editor }: { editor: Ieditor }): JSX.Element => {
  return (
    <h5 style={{ marginBottom: 0 }}>
      {editor.song && editor.song._id && editor.song._id !== '' ? 'Edit ' : 'Add '}
      Song
    </h5>
  );
};

interface IsongEditorDiv {
  editor: Ieditor,
  setNewEditor: (arg0: Ieditor) => void, auth: any
}
export const SongEditorDiv = ({ editor, setNewEditor, auth }: IsongEditorDiv) => {
  if (!editor.song.category) editor.song.category = 'original';
  return (
    <div
      className="material-content elevation3"
      style={{ maxWidth: '320px', margin: '30px auto' }}
    >
      <SongFormTitle editor={editor} />
      <form id="picsForm">
        <SongForm editor={editor} setNewEditor={setNewEditor}
        />
        <p>{' '}</p>
        <SongButtons editor={editor} setNewEditor={setNewEditor} auth={auth} addSongAPI={songEditorUtils.addSongAPI}
          updateSongAPI={songEditorUtils.updateSongAPI} />
      </form>
    </div>
  );
};

export const SongEditor = ({
  auth,
}: { auth: any }): JSX.Element => {
  const { editor, setNewEditor } = React.useContext(EditorContext);
  return <SongEditorDiv editor={editor} setNewEditor={setNewEditor} auth={auth} />;
};
