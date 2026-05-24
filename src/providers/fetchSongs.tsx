import type { Isong } from './Data.provider';

export const getSongs = async (setSongs: (arg0: Isong[]) => void): Promise<Isong[]> => {
  if (!window.location.href.includes('8888') && !window.location.href.includes('joshandmariamusic')) {
    try {
      const res = await fetch(`${process.env.BackendUrl}/song`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json() as Isong[];
      data.sort((a: Isong, b: Isong) => b.year - a.year);
      setSongs(data);
      return data;
    } catch (e) { console.log((e as Error).message); return [] as Isong[]; }
  } return [] as Isong[];
};
export default { getSongs };
