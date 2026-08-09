import type { Isong } from './Data.provider';

export const getSongs = async (setSongs: (arg0: Isong[]) => void): Promise<Isong[]> => {
  if (!window.location.href.includes('8888') && !window.location.href.includes('joshandmariamusic')) {
    try {
      const res = await fetch(`${process.env.BackendUrl}/song`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json() as Isong[];
      data.sort((a: Isong, b: Isong) => {
        const orderA = typeof a.orderBy === 'number' ? a.orderBy : 0;
        const orderB = typeof b.orderBy === 'number' ? b.orderBy : 0;
        if (orderB !== orderA) return orderB - orderA;
        return (b.year || 0) - (a.year || 0);
      });
      setSongs(data);
      return data;
    } catch (e) { console.log((e as Error).message); return [] as Isong[]; }
  } return [] as Isong[];
};
export default { getSongs };
