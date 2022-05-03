
import React from 'react';
import forms from '../../lib/forms';
import superagent from 'superagent';
import { defaultSong, EditorContext, Ieditor } from '../../providers/Editor.provider';
import type { Auth } from 'src/redux/mapStoreToProps';
import songEditorUtils from './songEditorUtils';
import { TextField } from '@mui/material';

export const validateSongInput = (id: string, value: string) => {
  let valid = true;
  if (id === 'title' || id === 'artist') {
    if (value.length < 1) valid = false;
  }
  if (id === 'url' && !value.includes('http')) valid = false;
  if (id === 'year' && Number(value) < 1990) valid = false;
  return valid;
};

export const onChangeSong = (
  evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, editor: Ieditor,
  setNewEditor: (arg0: Ieditor) => void,
): void => {
  evt.persist();
  const { target: { id, value } } = evt;
  const isValid = validateSongInput(id, value);
  const newEditor = {
    hasChanged: true, isValid, image: {}, tour: {},
    song: { ...editor.song, [id]: value },
  };
  setNewEditor(newEditor);
};

export const handleCategoryChange = (
  event: React.ChangeEvent<HTMLSelectElement>, editor: Ieditor,
  setNewEditor: (arg0: Ieditor
  ) => void): void => {
  setNewEditor(
    {
      hasChanged: true, isValid: true, image: {}, tour: {},
      song: { ...editor.song, category: event.target.value },
    },
  );
};

interface IsongInputProps {
  required: boolean; id: string;
  editor: Ieditor; setEditor: (arg0: Ieditor) => void;
}
export const SongInput = (props: IsongInputProps): JSX.Element => {
  const { required, editor, setEditor, id } = props;
  const { song } = editor;
  const songValue: any = song;
  // eslint-disable-next-line security/detect-object-injection
  const inputValue = songValue[id] || '';
  return (
    <label htmlFor={id}>
      {required ? '* ' : ''}{id}
      <TextField id={id} value={inputValue} onChange={(evt) => onChangeSong(evt, editor, setEditor)} />
    </label>
  );
};

export const MoreSongForm = (
  props: {
    setEditor: (arg0: Ieditor) => void,
    editor: Ieditor,
  },
): JSX.Element => {
  const { editor, setEditor } = props;
  return (
    <>
      <SongInput required={true} id="year" editor={editor} setEditor={setEditor} />
      <SongInput required={false} id="album" editor={editor} setEditor={setEditor} />
      <SongInput required={false} id="composer" editor={editor} setEditor={setEditor} />
      <SongInput required={false} id="image" editor={editor} setEditor={setEditor} />
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
      <SongInput required={true} id="title" editor={editor} setEditor={setEditor} />
      <SongInput required={true} id="url" editor={editor} setEditor={setEditor} />
      <SongInput required={true} id="artist" editor={editor} setEditor={setEditor} />
      <p>* Category</p>
      {forms.makeDropdown('category', editor.song.category,
        (evt: React.ChangeEvent<HTMLSelectElement>) => handleCategoryChange(evt,
          editor, setEditor), ['original', 'mission', 'pub'])}
      <MoreSongForm setEditor={setEditor} editor={editor} />
    </>
  );
};

export const EditSongButtons = (
  { setEditor, editor, auth }:
  {
    setEditor: (arg0: Ieditor) => void,
    editor: Ieditor,
    auth: Auth,
  },
): JSX.Element => {
  return (
    <span>
      <button className="floatRight" type="button" id="cancel-edit-song"
        onClick={() => setEditor(
          { isValid: false, hasChanged: false, song: defaultSong, tour: {}, image: {} },
        )}>
        Cancel
      </button>
      <button
        disabled={!editor.isValid}
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
        <SongButtons editor={editor} setEditor={setEditor} auth={auth} />
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
