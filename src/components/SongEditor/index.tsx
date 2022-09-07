
import { ChangeEvent, useContext } from 'react';
import superagent from 'superagent';
import { DataContext, ISong } from 'src/providers/Data.provider';
import type { Auth } from 'src/redux/mapStoreToProps';
import { Button, TextField } from '@mui/material';
import { defaultSong, EditorContext, Ieditor } from '../../providers/Editor.provider';
import songEditorUtils from './songEditorUtils';
import forms from '../../lib/forms';

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
  evt: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  editor: Ieditor,
  setNewEditor: (arg0: Ieditor) => void,
): void => {
  evt.persist();
  const { target: { id, value } } = evt;
  const isValid = validateSongInput(id, value);
  const newEditor = {
    hasChanged: true,
    isValid,
    image: {},
    tour: {},
    song: { ...editor.song, [id]: value },
  };
  setNewEditor(newEditor);
};

export const handleCategoryChange = (
  event: ChangeEvent<HTMLSelectElement>,
  editor: Ieditor,
  setNewEditor: (arg0: Ieditor
  ) => void,
): void => {
  setNewEditor(
    {
      hasChanged: true,
      isValid: true,
      image: {},
      tour: {},
      song: { ...editor.song, category: event.target.value },
    },
  );
};

interface IsongInputProps {
  required: boolean; id: string;
  editor: Ieditor; setEditor: (arg0: Ieditor) => void;
}
export function SongInput(props: IsongInputProps): JSX.Element {
  const {
    required, editor, setEditor, id,
  } = props;
  const { song } = editor;
  const songValue: any = song;
  // eslint-disable-next-line security/detect-object-injection
  const inputValue = songValue[id] || '';
  return (
    <label htmlFor={id}>
      {required ? '* ' : ''}
      {id}
      <TextField id={id} value={inputValue} onChange={(evt) => onChangeSong(evt, editor, setEditor)} />
    </label>
  );
}

export function MoreSongForm(props: {
  setEditor: (arg0: Ieditor) => void,
  editor: Ieditor,
}): JSX.Element {
  const { editor, setEditor } = props;
  return (
    <>
      <SongInput required id="year" editor={editor} setEditor={setEditor} />
      <SongInput required={false} id="album" editor={editor} setEditor={setEditor} />
      <SongInput required={false} id="composer" editor={editor} setEditor={setEditor} />
      <SongInput required={false} id="image" editor={editor} setEditor={setEditor} />
    </>
  );
}

interface IsongFormProps {
  editor: Ieditor,
  setEditor: (arg0: Ieditor) => void
}
export function SongForm(props: IsongFormProps): JSX.Element {
  const { editor, setEditor } = props;
  return (
    <>
      <SongInput required id="title" editor={editor} setEditor={setEditor} />
      <SongInput required id="url" editor={editor} setEditor={setEditor} />
      <SongInput required id="artist" editor={editor} setEditor={setEditor} />
      <p>* Category</p>
      {forms.makeDropdown(
        'category',
        editor.song.category,
        (evt: ChangeEvent<HTMLSelectElement>) => handleCategoryChange(
          evt,
          editor,
          setEditor,
        ),
        ['original', 'mission', 'pub'],
      )}
      <MoreSongForm setEditor={setEditor} editor={editor} />
    </>
  );
}

export function EditSongButtons({
  setEditor, editor, setSongs, auth,
}:
{
  setEditor: (arg0: Ieditor) => void,
  setSongs: (arg0: ISong[]) => void,
  editor: Ieditor,
  auth: Auth,
}): JSX.Element {
  return (
    <span>
      <Button
        className="floatRight"
        type="button"
        id="cancel-edit-song"
        onClick={() => setEditor(
          {
            isValid: false, hasChanged: false, song: defaultSong, tour: {}, image: {},
          },
        )}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        disabled={!editor.isValid}
        className=""
        id="update-song-button"
        type="button"
        onClick={() => songEditorUtils.updateSongAPI(superagent, editor.song, auth, setEditor, setSongs)}
      >
        Update Song
      </Button>
    </span>
  );
}

interface IsongButtonsProps {
  setEditor: (arg0: Ieditor) => void; editor: Ieditor; auth: Auth;
}
export function SongButtons({ editor, setEditor, auth }: IsongButtonsProps): JSX.Element {
  const { setSongs } = useContext(DataContext);
  return (
    <div style={{ textAlign: 'left', marginTop: '10px' }}>
      <span style={{
        fontSize: '16px', marginRight: '20px', position: 'relative', display: 'inline-block',
      }}
      >
        <i>* Required</i>
      </span>
      {editor.song._id ? <EditSongButtons editor={editor} setEditor={setEditor} setSongs={setSongs} auth={auth} />
        : (
          <Button
            variant="contained"
            id="add-song-button"
            disabled={!(editor.song.year && editor.song.title && editor.song.url && editor.song.artist)}
            type="button"
            onClick={() => songEditorUtils.addSongAPI(superagent, editor.song, auth, setEditor, setSongs)}
          >
            Add Song
          </Button>
        )}
    </div>
  );
}

export function SongFormTitle({ editor }: { editor: Ieditor }): JSX.Element {
  return (
    <h5 style={{ marginBottom: 0 }}>
      {editor.song && editor.song._id && editor.song._id !== '' ? 'Edit ' : 'Add '}
      Song
    </h5>
  );
}

interface IsongEditorDiv {
  editor: Ieditor,
  setEditor: (arg0: Ieditor) => void, auth: Auth
}
export function SongEditorDiv({ editor, setEditor, auth }: IsongEditorDiv) {
  if (!editor.song.category) editor.song.category = 'original';
  return (
    <div
      className="material-content elevation3"
      style={{ maxWidth: '320px', margin: '30px auto' }}
    >
      <SongFormTitle editor={editor} />
      <form id="picsForm">
        <SongForm
          editor={editor}
          setEditor={setEditor}
        />
        <p>{' '}</p>
        <SongButtons editor={editor} setEditor={setEditor} auth={auth} />
      </form>
    </div>
  );
}

export function SongEditor({
  auth,
}: { auth: Auth }): JSX.Element {
  const { editor, setEditor } = useContext(EditorContext);
  return <SongEditorDiv editor={editor} setEditor={setEditor} auth={auth} />;
}
