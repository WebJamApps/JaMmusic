import axios from 'axios';
import type { Isong } from './Data.provider';

export const getSongs = async (setSongs: (arg0: Isong[]) => void): Promise<Isong[]> => {
  if (!window.location.href.includes('8888') && !window.location.href.includes('joshandmariamusic')) {
    try {
      const { data }:{ data:Isong[] } = await axios.get(`${process.env.BackendUrl}/song`);
      data.sort((a:Isong, b:Isong) => b.year - a.year);
      setSongs(data);
      return data;
    } catch (e) { console.log((e as Error).message); return [] as Isong[]; }
  } return [] as Isong[];
};
export default { getSongs };
