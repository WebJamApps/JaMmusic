import React from 'react';
import type { MusicDashboardController } from '../../containers/MusicDashboard/MusicDashboardController';
import type { MusicDashboard } from '../../containers/MusicDashboard';
import type { ISong } from '../../providers/Songs.provider';
import songEditorUtils from './songEditorUtils';
import { EditorContext } from '../../providers/Editor.provider';

type PageProps = { editSong:ISong, songState:ISong, comp:MusicDashboard, controller:MusicDashboardController };

const SongEditor = ({
  editSong, songState, comp, controller,
}:PageProps): JSX.Element => {
  const { editor, setNewEditor } = React.useContext(EditorContext);
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
      {songEditorUtils.songForm(controller, songState, comp.onChangeSong, comp.handleCategoryChange)}
      {songEditorUtils.moreSongForm(songState, comp.onChangeSong)}
      <p>{' '}</p>
      {songEditorUtils.songButtons(songState, comp, editSong)}
    </form>
  </div>
  );
};
export default SongEditor;
