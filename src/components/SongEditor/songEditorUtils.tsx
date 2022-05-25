import type superagent from 'superagent';
import { Store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import type { ISong } from 'src/providers/Data.provider';
import type { Auth } from 'src/redux/mapStoreToProps';
import type { Ieditor } from 'src/providers/Editor.provider';

type NotificationType = 'success' | 'danger' | 'info' | 'default' | 'warning';

function notify(title: string, message: string, type: NotificationType) {
  Store.addNotification({
    title,
    message,
    type,
    insert: 'top',
    container: 'top-right',
    animationIn: ['animate__animated animate__fadeIn'],
    animationOut: ['animate__animated animate__fadeOut'],
    dismiss: {
      duration: 5000,
      onScreen: true,
    },
  });

}

const updateSongAPI = async (
  sa: typeof superagent, songChanges: ISong, auth: Auth,
  setEditor: (arg0: Ieditor) => void,
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
    notify('The song has been updated', '', 'success');
    window.location.reload(); //TODO do not reload but instead fetch songs and refresh storage
  } catch (e) {
    const eMessage = (e as Error).message;
    notify('Failed to update the song', eMessage, 'danger');
  }
};

const addSongAPI = async (
  sa: typeof superagent, songBody: ISong, auth: { token: string; },
  setNewEditor: (arg0: Ieditor) => void,
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
    window.location.reload();//TODO do not reload but instead fetch songs and refresh storage
  } catch (e) {
    const eMessage = (e as Error).message;
    notify('Failed to create the song', eMessage, 'danger');
  }
};

export default { updateSongAPI, addSongAPI };
