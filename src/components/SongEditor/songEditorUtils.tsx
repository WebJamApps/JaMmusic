import React from 'react';
import type superagent from 'superagent';
import type { ISong } from '../../providers/Songs.provider';
import type { MusicDashboard } from '../../containers/MusicDashboard';

async function updateSongAPI(comp:MusicDashboard): Promise<string> {
  const { songState } = comp.state;
  const { editSong } = comp.props;
  const { auth } = comp.props;
  const songChanges = { ...songState, _id: undefined };
  let r: superagent.Response;
  try {
    r = await comp.controller.superagent.put(`${process.env.BackendUrl}/song/${editSong._id}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${auth.token}`)
      .send(songChanges);
  } catch (e) { return `${e.message}`; }
  if (r.status === 200) { window.location.reload(); return 'song updated'; }
  return `${r.status} song was not updated`;
}

function resetSongForm(comp:MusicDashboard):void {
  const { dispatch } = comp.props;
  dispatch({
    type: 'EDIT_SONG',
    songData: {
      _id: '', category: '', year: 2021, title: '', url: '',
    },
  });
  comp.setState({
    songState: {
      _id: '', category: '', year: 2021, title: '', url: '',
    },
  });
  window.location.reload();
}

function editSongButtons(comp:MusicDashboard, editSong?: ISong):JSX.Element | null {
  return (editSong && editSong._id !== '' ? (
    <span>
      <button className="floatRight" type="button" id="cancel-edit-song" onClick={() => resetSongForm(comp)}>
        Cancel
      </button>
      <button
        className=""
        type="button"
        onClick={() => updateSongAPI(comp)}
      >
        Edit
        {' '}
        Song
      </button>
    </span>
  ) : null);
}

export default { updateSongAPI, resetSongForm, editSongButtons };
