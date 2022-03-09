import { createContext, ReactChild, useEffect } from 'react';
import createPersistedState from 'use-persisted-state';
import fetchSongs, { defaultSong } from './fetchSongs';
import { MakeProvider } from './MakeProvider';

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
[ISong[], (arg0: ISong[]) => void] = 
createPersistedState('songs', sessionStorage);

export const SongsContext = createContext({
  songs: [defaultSong],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setSongs:/*istanbul ignore next */(_arg0:ISong[]) => { },
});

type Props = { children: ReactChild };

export const SongsProvider = ({ children }: Props): JSX.Element => {
  const [songs, setSongs] = useSongsState([defaultSong]);
  const Provider = MakeProvider({ Context:SongsContext, fetchFunc:fetchSongs.getSongs, setFunc:setSongs });
  // useEffect(() => {
  //   fetchSongs.getSongs(setSongs);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);// empty array here to stop it from repeatedly fetching the songs

  return (<Provider value={{ songs, setSongs }}>{children}</Provider>
  );
};

// export const SongsProvider = ({ children }: Props): JSX.Element => {
//   const { Provider } = SongsContext;
//   const [songs, setSongs] = useSongsState([defaultSong]);

//   useEffect(() => {
//     fetchSongs.getSongs(setSongs);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);// empty array here to stop it from repeatedly fetching the songs

//   return (<Provider value={{ songs, setSongs }}>{children}</Provider>
//   );
// };

