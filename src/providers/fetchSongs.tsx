import superagent from 'superagent';
import type { Isong } from './Data.provider';

export const defaultSong: Isong = {
  category: '', title: '', url: '', _id: '', year: 2000,
};

export const getSongs = async (setSongs: (arg0: Isong[]) => void): Promise<Isong[]> => {
  let res: { body: Isong[] }, newSongs: Isong[] = [];
  if (!window.location.href.includes('8888') && !window.location.href.includes('joshandmariamusic')) {
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
