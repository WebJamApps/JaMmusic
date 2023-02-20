import { createContext, useEffect, useState } from 'react';
import fetchGigs, { defaultGig } from './fetchGigs';
import fetchPics from './fetchPics';
import fetchSongs from './fetchSongs';
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const setGigsDef = (_arg0: Igig[] | null) => { };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const setSongsDef = (_arg0: Isong[]) => { };

export const getGigsDef = () => true;

export const getPicsDef = () => true;

export const getSongsDef = async () => [] as Isong[];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const setPicsDef = (_arg0: Ipic[] | null) => { };

export const DataContext = createContext({
  gigs: null as Igig[] | null,
  setGigs: setGigsDef,
  getGigs: getGigsDef,
  pics: null as Ipic[] | null,
  setPics: setPicsDef,
  getPics: getPicsDef,
  songs: null as Isong[] | null,
  setSongs: setSongsDef,
  getSongs: getSongsDef,
});

export const makeGetGigs = (setGigs: (arg0: Igig[] | null) => void) => () => fetchGigs.getGigs(setGigs);

export const makeGetPics = (setPics: (arg0: Ipic[] | null) => void) => () => fetchPics.getPics(setPics);

export function DataProvider({ children }:any): JSX.Element {
  const [gigs, setGigs] = useState([defaultGig] as Igig[] | null);
  const [songs, setSongs] = useState(null as Isong[] | null);
  const [pics, setPics] = useState(null as Ipic[] | null);
  const getPics = makeGetPics(setPics);
  const getGigs = makeGetGigs(setGigs);
  const getSongs = async () => {
    await fetchSongs.getSongs(setSongs);
  };
  useEffect(() => { getSongs(); }, []);
  const Provider = MakeProvider(
    { Context: DataContext, fetches: [fetchGigs.getGigs, fetchPics.getPics], setters: [setGigs, setPics] },
  );
  return (
    <Provider value={{
      gigs, setGigs, getGigs, songs, setSongs, getSongs, pics, setPics, getPics,
    }}
    >
      {children}
    </Provider>
  );
}
