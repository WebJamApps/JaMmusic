import { createContext, ReactChild } from 'react';
import createPersistedState from 'use-persisted-state';
import fetchGigs, { defaultGig } from './fetchGigs';
import fetchSongs, { defaultSong } from './fetchSongs';
import { MakeProvider } from './MakeProvider';

export interface IGig {
  modify?:JSX.Element,
  datetime: string;
  more?: string;
  date: string;
  time: string;
  tickets: string;
  venue: string;
  location: string;
  _id?: string;
  id?:number;
}

export interface ISong {
  artist?: string;
  composer?: string;
  category: string;
  album?: string;
  year: number;
  image?: string;
  title: string;
  url: string;
  _id?: string;
  modify?: JSX.Element
}

const useSongsState: (arg0: ISong[]) =>
[ISong[], (arg0: ISong[]) => void] = createPersistedState('songs', sessionStorage);

const useGigsState:(arg0: IGig[]) =>
[IGig[], (arg0: IGig[]) => void] = createPersistedState('gigs', sessionStorage);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const setGigsDef = (_arg0:IGig[]) => {};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const setSongsDef = (_arg0:ISong[]) => {};

export const DataContext = createContext({
  gigs: [defaultGig],
  setGigs: setGigsDef,
  songs: [defaultSong],
  setSongs: setSongsDef,
});

export function DataProvider({ children }: { children: ReactChild }): JSX.Element {
  const [gigs, setGigs] = useGigsState([defaultGig]);
  const [songs, setSongs] = useSongsState([defaultSong]);
  const Provider = MakeProvider({ Context: DataContext, fetches: [fetchGigs.getGigs, fetchSongs.getSongs], setters: [setGigs, setSongs] });
  return (
    <Provider value={{
      gigs, setGigs, songs, setSongs,
    }}
    >
      {children}
    </Provider>
  );
}
