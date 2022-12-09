import { createContext, ReactChild } from 'react';
import createPersistedState from 'use-persisted-state';
import fetchGigs, { defaultGig } from './fetchGigs';
import fetchSongs, { defaultSong } from './fetchSongs';
import { MakeProvider } from './MakeProvider';

export interface Igig {
  modify?: JSX.Element,
  datetime: Date | null;
  more?: string;
  date?: string;
  time?: string;
  tickets: string;
  venue: string;
  location?: string;
  _id?: string;
  id?: number;
  city?: string;
  usState?: string;
}

export interface Isong {
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

export interface Ipic {
  '_id'?: string;
  'url': string;
  'title': string;
  'type': string;
  'caption': string;
  'thumbnail': string | undefined;
  'link': string;
  'modify': JSX.Element | undefined;
  'comments': string;
  'created_at'?: string;
  'updated_at'?: string;
}

const useSongsState: (arg0: Isong[]) =>
[Isong[], (arg0: Isong[]) => void] = createPersistedState('songs', sessionStorage);

const useGigsState: (arg0: Igig[]) =>
[Igig[], (arg0: Igig[]) => void] = createPersistedState('gigs', sessionStorage);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const setGigsDef = (_arg0: Igig[]) => { };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const setSongsDef = (_arg0: Isong[]) => { };

export const getGigsDef = () => true;

export const DataContext = createContext({
  gigs: [defaultGig],
  setGigs: setGigsDef,
  getGigs: getGigsDef,
  songs: [defaultSong],
  setSongs: setSongsDef,
});

export const makeGetGigs = (setGigs: (arg0: Igig[]) => void) => () => fetchGigs.getGigs(setGigs);

export function DataProvider({ children }: { children: ReactChild }): JSX.Element {
  const [gigs, setGigs] = useGigsState([defaultGig]);
  const [songs, setSongs] = useSongsState([defaultSong]);
  const getGigs = makeGetGigs(setGigs);
  const Provider = MakeProvider({ Context: DataContext, fetches: [fetchGigs.getGigs, fetchSongs.getSongs], setters: [setGigs, setSongs] });
  return (
    <Provider value={{
      gigs, setGigs, getGigs, songs, setSongs,
    }}
    >
      {children}
    </Provider>
  );
}
