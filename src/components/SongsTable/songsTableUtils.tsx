import React from 'react';
import type { Dispatch, AnyAction } from 'redux';
import superagent from 'superagent';
import type { ISong } from '../../providers/Songs.provider';

const editSong = (data: ISong, dispatch:Dispatch<AnyAction>, picsForm:HTMLElement | null): boolean => {
  const songData = { ...data, modify: undefined };
  // eslint-disable-next-line no-console
  console.log('display the create new song form with the edit song content prepopulated');
  dispatch({ type: 'EDIT_SONG', songData });
  if (picsForm && picsForm.scrollIntoView) picsForm.scrollIntoView({ behavior: 'smooth' });
  return true;
};

const deleteSong = async (id: string, token:string): Promise<string> => { // eslint-disable-next-line no-restricted-globals
  const result = confirm('Deleting song, are you sure?');// eslint-disable-line no-alert
  if (result) {
    let res: superagent.Response;
    try {
      res = await superagent.delete(`${process.env.BackendUrl}/song/${id}`)
        .set('Authorization', `Bearer ${token}`).set('Accept', 'application/json');
    } catch (e) { return `${e.message}`; }
    if (res.status === 200) { window.location.reload(); return 'deleted pic'; }
    return `${res.status} ${res.body}`;
  }
  return 'no delete';
};

const makeSongButtons = (deleteSongId: string,
  editSongId: string, token: string, dispatch: Dispatch<AnyAction>, song: ISong):JSX.Element => {
  const picsForm = document.getElementById('picsForm');
  return (
    <div>
      <button type="button" id={deleteSongId} onClick={() => deleteSong(song._id, token)}>Delete</button>
      <p>{' '}</p>
      <button
        type="button"
        id={editSongId}
        onClick={() => {
          editSong(song, dispatch, picsForm);
        }}
      >
        Edit
      </button>
    </div>
  );
};

const addButtons = (arr: ISong[], token:string, dispatch:Dispatch<AnyAction>): ISong[] => {
  const newArr = arr;/* eslint-disable security/detect-object-injection */
  for (let i = 0; i < arr.length; i += 1) {
    const deleteSongId = `deleteSong${newArr[i]._id}`;
    const editSongId = `editSong${newArr[i]._id}`;
    newArr[i].modify = makeSongButtons(deleteSongId, editSongId, token, dispatch, newArr[i]);
  }
  return newArr;
};

export default { addButtons, editSong, deleteSong };
