import React from 'react';
import type superagent from 'superagent';
import type { MusicDashboardController } from '../../containers/MusicDashboard/MusicDashboardController';
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

function songForm(controller:MusicDashboardController, songState: ISong, onChangeSong: React.ChangeEventHandler<HTMLInputElement>,
  handleCategoryChange: (event: React.ChangeEvent<HTMLSelectElement>, isSelected: boolean) => void):JSX.Element {
  return (
    <>
      <label htmlFor="title">
        * Title
        <input id="title" value={songState.title} onChange={onChangeSong} />
      </label>
      <label htmlFor="url">
        * Url
        <input id="url" value={songState.url} onChange={onChangeSong} />
      </label>
      <label htmlFor="artist">
        * Artist
        <input id="artist" value={songState.artist} onChange={onChangeSong} />
      </label>
      <p>* Category</p>
      {controller.forms.makeDropdown('category', songState.category, handleCategoryChange, ['original', 'mission', 'pub'])}
    </>
  );
}

function moreSongForm(songState: ISong, onChangeSong: React.ChangeEventHandler<HTMLInputElement>):JSX.Element {
  return (
    <>
      <label htmlFor="artist">
        Album
        <input id="album" value={songState.album} onChange={onChangeSong} />
      </label>
      <label htmlFor="image">
        Image
        <input id="image" value={songState.image} onChange={onChangeSong} />
      </label>
      <label htmlFor="composer">
        Composer
        <input id="composer" value={songState.composer} onChange={onChangeSong} />
      </label>
      <label htmlFor="year">
        * Year
        <input type="number" id="year" value={songState.year} onChange={onChangeSong} />
      </label>
    </>
  );
}

const addSongAPI = async (songState: ISong, auth: { token: string; }, controller: MusicDashboardController): Promise<string> => {
  const newSong = { ...songState, _id: undefined };
  let r: superagent.Response;
  try {
    r = await controller.superagent.post(`${process.env.BackendUrl}/song`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${auth.token}`)
      .send(newSong);
  } catch (e) { return `${e.message}`; }
  if (r.status === 201) { window.location.reload(); return 'song created'; }
  return `${r.status} song was not created`;
};

const songButtons = (songState: ISong, comp:MusicDashboard, editSong?: ISong): JSX.Element => (
  <div style={{ textAlign: 'left', marginTop: '10px' }}>
    <span style={{
      fontSize: '16px', marginRight: '20px', position: 'relative', display: 'inline-block',
    }}
    >
      <i>* Required</i>
    </span>
    {editSongButtons(comp, editSong)}
    {!editSong || editSong._id === '' ? (
      <button
        id="add-song-button"
        disabled={!(songState.year && songState.title && songState.url && songState.artist && songState.category)}
        type="button"
        onClick={() => addSongAPI(songState, comp.props.auth, comp.controller)}
      >
        Add Song
      </button>
    ) : null}
  </div>
);

export default {
  updateSongAPI, addSongAPI, resetSongForm, editSongButtons, songForm, moreSongForm, songButtons,
};
