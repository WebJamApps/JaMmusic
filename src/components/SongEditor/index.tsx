import React from 'react';
import type { MusicDashboardController } from '../../containers/MusicDashboard/MusicDashboardController';
import type { MusicDashboard } from '../../containers/MusicDashboard';
// import type { ISong } from '../../providers/Songs.provider';
import songEditorUtils, { SongForm } from './songEditorUtils';
import { EditorContext } from '../../providers/Editor.provider';

type PageProps = { comp:MusicDashboard, controller:MusicDashboardController };

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
      <SongForm controller={controller} songState={song} onChangeSong={comp.onChangeSong} handleCategoryChange={comp.handleCategoryChange}/>
      {/* {songEditorUtils.songForm(controller, editor.song, comp.onChangeSong, comp.handleCategoryChange)} */}
      {/* {songEditorUtils.moreSongForm(song, comp.onChangeSong)} */}
      <p>{' '}</p>
      {songEditorUtils.songButtons(song, comp, setNewEditor, song)}
    </form>
  </div>
  );
};
export default SongEditor;
