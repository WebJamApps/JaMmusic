import type superagent from 'superagent';
import type { ISong } from 'src/providers/Data.provider';
import type { Auth } from 'src/redux/mapStoreToProps';
import type { Ieditor } from '.';

const updateSongAPI = async (
  sa: typeof superagent, songChanges: ISong, auth: Auth, 
  setEditor: (arg0: Ieditor) => void,
): Promise<string> => {
  const id = songChanges._id;
  delete songChanges._id;
  let r: superagent.Response;
  try {
    r = await sa.put(`${process.env.BackendUrl}/song/${id}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${auth.token}`)
      .send(songChanges);
  } catch (e) { return (e as Error).message; } //TODO display error message
  if (r.status === 200) {
    setEditor({ song: {}, image: {}, tour: {} } as Ieditor);
    return 'song updated';
  } //TODO do not reload but instead fetch songs and refresh storage
  return `${r.status} song was not updated`;
};

const addSongAPI = async (
  sa: typeof superagent, songBody: ISong, auth: { token: string; },
  setNewEditor: (arg0: Ieditor) => void,
): Promise<string> => {
  const newSong = { ...songBody };
  delete newSong._id;
  let r: superagent.Response;
  try {
    r = await sa.post(`${process.env.BackendUrl}/song`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${auth.token}`)
      .send(newSong);
  } catch (e) { return (e as Error).message; } //TODO display error message
  if (r.status === 201) {
    setNewEditor({ song: {}, image: {}, tour: {} } as Ieditor);
    window.location.reload();//TODO do not reload but instead fetch songs and refresh storage
    return 'song created';
  }
  return `${r.status} song was not created`;
};

export default { updateSongAPI, addSongAPI };
