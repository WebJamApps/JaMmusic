import superagent from 'superagent';
import type { ISong } from './Songs.provider';

export const defaultSong:ISong = {
  category: '', title: '', url: '', _id: '', year: 2000,
};

export const getSongs = async (setSongs: { (value: React.SetStateAction<ISong[]>): void; (arg0: ISong[]): void; }):Promise<ISong[]> => {
  let res:{ body:ISong[] }, newSongs:ISong[] = [];
  if (!window.location.href.includes('8888') && !window.location.href.includes('joshandmariamusic')){
    try {
      res = await superagent.get(`${process.env.BackendUrl}/song`).set('Accept', 'application/json');
    } catch (e) { console.log((e as Error).message); return [defaultSong]; }
    newSongs = res.body;
    try {
      newSongs.sort((a, b) => b.year - a.year);
    } catch (error) { console.log(error); newSongs = []; }
    setSongs(newSongs);
  }
  return newSongs;
};

export default { getSongs };
