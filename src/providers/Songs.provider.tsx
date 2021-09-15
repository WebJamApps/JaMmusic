/* eslint-disable no-console */
import React, {
  createContext, useState, ReactChild, useEffect,
} from 'react';
import fetchSongs, { defaultSong } from './fetchSongs';
// import superagent from 'superagent';

export interface ISong {
  artist?: string;
  composer?: string;
  category: string;
  album?: string;
  year: number;
  image?: string;
  title: string;
  url: string;
  _id: string;
  modify?:JSX.Element
}

// export const fetchSongs = async (setSongs: { (value: React.SetStateAction<ISong[]>): void; (arg0: ISong[]): void; }):Promise<ISong[]> => {
//   let res:{ body:ISong[] };
//   try {
//     res = await superagent.get(`${process.env.BackendUrl}/song`).set('Accept', 'application/json');
//   } catch (e) { console.log((e as Error).message); return [defaultSong]; }
//   const newSongs = res.body;
//   try {
//     newSongs.sort((a, b) => b.year - a.year);
//   } catch (error) { console.log(error); }
//   setSongs(newSongs);
//   return newSongs;
// };

export const SongsContext = createContext({
  test: '',
  songs: [defaultSong],
});
type Props = { children: ReactChild };

export const SongsProvider = ({ children }: Props): JSX.Element => {
  const { Provider } = SongsContext;
  const [test] = useState('the songs provider has been successfully connected :)');
  const [songs, setSongs] = useState<ISong[]>([defaultSong]);
  useEffect(() => {
    fetchSongs.getSongs(setSongs);
  }, []);
  return (<Provider value={{ test, songs }}>{children}</Provider>
  );
};

export default SongsProvider;
