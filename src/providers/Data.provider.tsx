import { createContext, ReactChild } from 'react';
import createPersistedState from 'use-persisted-state';
import fetchGigs, { defaultGig } from './fetchGigs';
import fetchPics from './fetchPics';
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

const useGigsState: (arg0: Igig[] | null) =>
[Igig[] | null, (arg0: Igig[] | null) => void] = createPersistedState('gigs', sessionStorage);

const usePicsState: (arg0: Ipic[] | null) =>
[Ipic[] | null, (arg0: Ipic[] | null) => void] = createPersistedState('pics', sessionStorage);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const setGigsDef = (_arg0: Igig[] | null) => { };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const setSongsDef = (_arg0: Isong[]) => { };

export const getGigsDef = () => true;

export const getPicsDef = () => true;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const setPicsDef = (_arg0: Ipic[] | null) => { };

export const DataContext = createContext({
  gigs: [defaultGig],
  setGigs: setGigsDef,
  getGigs: getGigsDef,
  pics: null as Ipic[] | null,
  setPics: setPicsDef,
  getPics: getPicsDef,
  songs: [defaultSong],
  setSongs: setSongsDef,
});

export const makeGetGigs = (setGigs: (arg0: Igig[] | null) => void) => () => fetchGigs.getGigs(setGigs);

export const makeGetPics = (setPics: (arg0: Ipic[] | null) => void) => () => fetchPics.getPics(setPics);

export function DataProvider({ children }: { children: ReactChild }): JSX.Element {
  const [gigs, setGigs] = useGigsState([defaultGig] as Igig[] | null);
  const [songs, setSongs] = useSongsState([defaultSong]);
  const [pics, setPics] = usePicsState(null);
  const getPics = makeGetPics(setPics);
  const getGigs = makeGetGigs(setGigs);
  const Provider = MakeProvider(
    { Context: DataContext, fetches: [fetchGigs.getGigs, fetchSongs.getSongs, fetchPics.getPics], setters: [setGigs, setSongs, setPics] },
  );
  return (
    <Provider value={{
      gigs, setGigs, getGigs, songs, setSongs, pics, setPics, getPics,
    }}
    >
      {children}
    </Provider>
  );
}
