import React, {
  createContext, useState, ReactChild, useEffect,
} from 'react';
import createPersistedState from 'use-persisted-state';
import fetchSongs, { defaultSong } from './fetchSongs';
const useSongsState = createPersistedState('songs', sessionStorage);
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

export const SongsContext = createContext({
  test: '',
  songs: [defaultSong],
  resetSongs:()=>{},
});
type Props = { children: ReactChild };

export const SongsProvider = ({ children }: Props): JSX.Element => {
  const { Provider } = SongsContext;
  const [test] = useState('the songs provider has been successfully connected :)');
  const [songs, setSongs] = useSongsState<ISong[]>([defaultSong]);
  const resetSongs:any = setSongs;
  useEffect(() => {
    fetchSongs.getSongs(setSongs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);// if we don't include this as empty array, it keeps repeatedly fetching the songs
  return (<Provider value={{ test, songs, resetSongs }}>{children}</Provider>
  );
};

export default SongsProvider;
