import type superagent from 'superagent';
import 'react-notifications-component/dist/theme.css';
import type { ISong } from 'src/providers/Data.provider';
import type { Ieditor } from 'src/providers/Editor.provider';
import fetchSongs from 'src/providers/fetchSongs';
import commonUtils from 'src/lib/commonUtils';
import type { Iauth } from 'src/providers/Auth.provider';

const updateSongAPI = async (
  sa: typeof superagent,
  songChanges: ISong,
  auth: Iauth,
  setEditor: (arg0: Ieditor) => void,
  setSongs: (arg0: ISong[]) => void,
): Promise<void> => {
  const id = songChanges._id;
  delete songChanges._id;
  let r: superagent.Response;
  try {
    r = await sa.put(`${process.env.BackendUrl}/song/${id}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${auth.token}`)
      .send(songChanges);
    if (r.status !== 200) throw new Error(`${r.status} song was not updated`);
    setEditor({ song: {}, image: {}, tour: {} } as Ieditor);
    commonUtils.notify('The song has been updated', '', 'success');
    await fetchSongs.getSongs(setSongs);
  } catch (e) {
    const eMessage = (e as Error).message;
    commonUtils.notify('Failed to update the song', eMessage, 'danger');
  }
};

const addSongAPI = async (
  sa: typeof superagent,
  songBody: ISong,
  auth: { token: string; },
  setNewEditor: (arg0: Ieditor) => void,
  setSongs: (arg0: ISong[]) => void,
): Promise<void> => {
  const newSong = { ...songBody };
  delete newSong._id;
  let r: superagent.Response;
  try {
    r = await sa.post(`${process.env.BackendUrl}/song`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${auth.token}`)
      .send(newSong);
    if (r.status !== 201) throw new Error(`${r.status} song was not created`);
    setNewEditor({ song: {}, image: {}, tour: {} } as Ieditor);
    commonUtils.notify(`${newSong.title} song was created`, '', 'success');
    await fetchSongs.getSongs(setSongs);
  } catch (e) {
    const eMessage = (e as Error).message;
    commonUtils.notify('Failed to create the song', eMessage, 'danger');
  }
};

export default { updateSongAPI, addSongAPI };
