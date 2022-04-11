
import React, { useEffect, useState } from 'react';
import forms from '../../lib/forms';
import superagent from 'superagent';
import { EditorContext } from '../../providers/Editor.provider';
import type { ISong } from 'src/providers/Data.provider';
import type { Auth } from 'src/redux/mapStoreToProps';
import songEditorUtils from './songEditorUtils';

export interface Ieditor { song: ISong; tour: Record<string, unknown>; image: Record<string, unknown>; }
  
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
    setEditor: (arg0: Ieditor) => void
  }): JSX.Element => {
  const { editor, setEditor } = editorContext;
  const { song } = editor;
  const songValue: any = song;
  // eslint-disable-next-line security/detect-object-injection
  const inputValue = songValue[id] || '';
  return (<label htmlFor={id}>
    {required ? '* ' : ''}{id}
    <input id={id} value={inputValue} onChange={(evt) => onChangeSong(evt, editor, setEditor)} />
  </label>
  );
};

export const MoreSongForm = (props: {
  setEditor: (arg0: Ieditor) => void,
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
  setEditor: (arg0: Ieditor) => void
}
export const SongForm = (props: IsongFormProps): JSX.Element => {
  const { editor, setEditor } = props;
  return (
    <>
      {makeInput(true, 'title', props)}
      {makeInput(true, 'url', props)}
      {makeInput(true, 'artist', props)}
      <p>* Category</p>
      {forms.makeDropdown('category', editor.song.category,
        (evt: React.ChangeEvent<HTMLSelectElement>) => handleCategoryChange(evt,
          editor, setEditor), ['original', 'mission', 'pub'])}
      <MoreSongForm setEditor={setEditor} editor={editor} onChangeSong={onChangeSong} />
    </>
  );
};

export const EditSongButtons = ({ setEditor, editor, auth }:
{
  setEditor: (arg0: Ieditor) => void,
  editor: Ieditor,
  auth: Auth,
}): JSX.Element => {
  return (
    <span>
      <button className="floatRight" type="button" id="cancel-edit-song"
        onClick={() => setEditor({ song: { category: 'original', year: 2022, title: '', url: '' }, tour: {}, image: {} })}>
        Cancel
      </button>
      <button
        className=""
        id="update-song-button"
        type="button"
        onClick={() => songEditorUtils.updateSongAPI(superagent, editor.song, auth, setEditor)}
      >
        Update
        {' '}
        Song
      </button>
    </span>
  );
};

interface IsongButtonsProps {
  setEditor: (arg0: Ieditor) => void; editor: Ieditor; auth: Auth; 
}
export const SongButtons = ({ editor, setEditor, auth }: IsongButtonsProps): JSX.Element => {
  return (
    <div style={{ textAlign: 'left', marginTop: '10px' }}>
      <span style={{
        fontSize: '16px', marginRight: '20px', position: 'relative', display: 'inline-block',
      }}
      >
        <i>* Required</i>
      </span>
      {editor.song._id ? <EditSongButtons editor={editor} setEditor={setEditor} auth={auth} /> :
        <button
          id="add-song-button"
          disabled={!(editor.song.year && editor.song.title && editor.song.url && editor.song.artist)}
          type="button"
          onClick={() => songEditorUtils.addSongAPI(superagent, editor.song, auth, setEditor)}
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
  setEditor: (arg0: Ieditor) => void, auth: Auth
}
export const SongEditorDiv = ({ editor, setEditor, auth }: IsongEditorDiv) => {
  if (!editor.song.category) editor.song.category = 'original';
  return (
    <div
      className="material-content elevation3"
      style={{ maxWidth: '320px', margin: '30px auto' }}
    >
      <SongFormTitle editor={editor} />
      <form id="picsForm">
        <SongForm editor={editor} setEditor={setEditor}
        />
        <p>{' '}</p>
        <SongButtons editor={editor} setEditor={setEditor} auth={auth}/>
      </form>
    </div>
  );
};

export const SongEditor = ({
  auth,
}: { auth: Auth }): JSX.Element => {
  const { editor, setEditor } = React.useContext(EditorContext);
  return <SongEditorDiv editor={editor} setEditor={setEditor} auth={auth} />;
};
