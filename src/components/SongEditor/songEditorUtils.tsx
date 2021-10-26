import type superagent from 'superagent';
// import type { MusicDashboardController } from '../../containers/MusicDashboard/MusicDashboardController';
import type { ISong } from '../../providers/Songs.provider';
import type { MusicDashboard } from '../../containers/MusicDashboard';

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
    window.location.reload(); return 'song updated'; 
  } // do not reload but instead fetch songs and refresh storage
  return `${r.status} song was not updated`;
}

// function resetSongForm(comp:MusicDashboard):void {
//   const { dispatch } = comp.props;
//   dispatch({
//     type: 'EDIT_SONG',
//     songData: {
//       _id: '', category: '', year: 2021, title: '', url: '',
//     },
//   });
//   comp.setState({
//     songState: {
//       _id: '', category: '', year: 2021, title: '', url: '',
//     },
//   });
//   window.location.reload();
// }

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
    window.location.reload(); return 'song created'; 
  } // do not reload but instead fetch songs and refresh storage
  return `${r.status} song was not created`;
};

export default {
  updateSongAPI, addSongAPI,
};
