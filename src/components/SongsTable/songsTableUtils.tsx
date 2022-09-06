
import superagent from 'superagent';
import type { ISong } from 'src/providers/Data.provider';

const editSong = (data: ISong, makeNewEditor:any, editor:any, picsForm:HTMLElement | null): boolean => {
  const songData = { ...data, modify: undefined };
  makeNewEditor({ ...editor, song: songData }); // this is storing the song globally in redux
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
    } catch (e) { return (e as Error).message; }
    if (res.status === 200) { window.location.reload(); return 'deleted pic'; }
    return `${res.status} ${res.body}`;
  }
  return 'no delete';
};

const makeSongButtons = (
  deleteSongId: string,
  editSongId: string,
  token: string,
  makeNewEditor:any,
  editor:any,
  song: ISong,
):JSX.Element => {
  const picsForm = document.getElementById('picsForm');
  return (
    <div>
      <button type="button" id={deleteSongId} onClick={() => deleteSong(song._id as string, token)}>Delete</button>
      <p>{' '}</p>
      <button
        type="button"
        id={editSongId}
        onClick={() => {
          editSong(song, makeNewEditor, editor, picsForm); // Here is what we need to change!
        }}
      >
        Edit
      </button>
    </div>
  );
};

const addButtons = (arr: ISong[], token:string, setNewEditor:any, editor:any): ISong[] => {
  const newArr = arr;/* eslint-disable security/detect-object-injection */
  for (let i = 0; i < arr.length; i += 1) {
    const deleteSongId = `deleteSong${newArr[i]._id}`;
    const editSongId = `editSong${newArr[i]._id}`;
    newArr[i].modify = makeSongButtons(deleteSongId, editSongId, token, setNewEditor, editor, newArr[i]);
  }
  return newArr;
};

export default { addButtons, editSong, deleteSong };
