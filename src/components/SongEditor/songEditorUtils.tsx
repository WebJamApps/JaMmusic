import type superagent from 'superagent';
import type { ISong } from 'src/providers/Data.provider';
import fetchSongs from 'src/providers/fetchSongs';

async function updateSongAPI(sa:typeof superagent, songChanges:ISong, auth:any, setNewEditor:any): Promise<string> {
  const id = songChanges._id;
  delete songChanges._id;
  let r: superagent.Response;
  try {
    r = await sa.put(`${process.env.BackendUrl}/song/${id}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${auth.token}`)
      .send(songChanges);
  } catch (e) { return (e as Error).message; }
  if (r.status === 200) { 
    setNewEditor({ song:{}, image:{}, tour:{} }); 
    return 'song updated'; 
  } // do not reload but instead fetch songs and refresh storage
  return `${r.status} song was not updated`;
}

const addSongAPI = async (sa: typeof superagent, songBody:ISong, auth: { token: string; }, setNewEditor:any): Promise<string> => {
  const newSong = { ...songBody };
  delete newSong._id;
  let r: superagent.Response;
  try {
    r = await sa.post(`${process.env.BackendUrl}/song`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${auth.token}`)
      .send(newSong);
  } catch (e) { return (e as Error).message; }
  if (r.status === 201) {
    setNewEditor({ song:{}, image:{}, tour:{} });
    fetchSongs.getSongs(newSong);
    return 'song created'; 
  } // do not reload but instead fetch songs and refresh storage
  return `${r.status} song was not created`;
};

export default {
  updateSongAPI, addSongAPI,
};
