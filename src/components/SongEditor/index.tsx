import React from 'react';
import type { MusicDashboardController } from '../../containers/MusicDashboard/MusicDashboardController';
import type { MusicDashboard } from '../../containers/MusicDashboard';
// import type { ISong } from '../../providers/Songs.provider';
import songEditorUtils, { SongForm } from './songEditorUtils';
import { EditorContext } from '../../providers/Editor.provider';

type PageProps = { comp:MusicDashboard, controller:MusicDashboardController };

const onChangeSong = (evt: React.ChangeEvent<HTMLInputElement>, editor:any, setNewEditor:any): void => {
  evt.persist();
  const newEditor = { image:{}, tour:{}, song:{ ...editor.song, [evt.target.id]: evt.target.value } };
  setNewEditor(newEditor);
};

const SongEditor = ({
  comp, controller,
}:PageProps): JSX.Element => {
  const { editor, setNewEditor } = React.useContext(EditorContext);
  let song = { ...editor.song };
  if (!song._id) song = {
    artist:'',
    composer:'',
    category:'original',
    album:'',
    year: 2021,
    image:'',
    title:'',
    url:'',
  };
  return (
  <div
    className="material-content elevation3"
    style={{ maxWidth: '320px', margin: '30px auto' }}
  >
    <h5 style={{ marginBottom: 0 }}>
    {editor.song && editor.song._id && editor.song._id !== '' ? 'Edit ' : 'Add '}
      {/* {editSong && editSong._id && editSong._id !== '' ? 'Edit ' : 'Add '} */}
      Song
    </h5>
    <form id="picsForm">
      <SongForm controller={controller} editor={editor} setNewEditor={setNewEditor} 
      onChangeSong={onChangeSong} handleCategoryChange={comp.handleCategoryChange}
      />
      <p>{' '}</p>
      {songEditorUtils.songButtons(song, comp, setNewEditor, song)}
    </form>
  </div>
  );
};
export default SongEditor;
