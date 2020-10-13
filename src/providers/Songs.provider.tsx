import React, {
  createContext, useState, ReactChild, useEffect,
} from 'react';
import superagent from 'superagent';

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

export const defaultSong = {
  category: '', title: '', url: '', _id: '', year: 2000,
};

export const fetchSongs = async ():Promise<ISong[]> => {
  let res:{body:ISong[]};
  try {
    res = await superagent.get(`${process.env.BackendUrl}/song`).set('Accept', 'application/json');
  // eslint-disable-next-line no-console
  } catch (e) { console.log(e.message); return [defaultSong]; }
  const newSongs = res.body.sort((a, b) => b.year - a.year);
  console.log(res.body);
  return newSongs;
};

export const SongsContext = createContext({
  test: '',
  songs: [defaultSong],
});
type Props = {children: ReactChild};

const SongsProvider = ({ children }: Props): JSX.Element => {
  const { Provider } = SongsContext;
  const [test] = useState('the songs provider has been successfully connected :)');
  const [songs, setSongs] = useState<ISong[]>([defaultSong]);
  useEffect(() => {
    fetchSongs().then((res) => {
      setSongs(res);
    });
  }, []);
  return (<Provider value={{ test, songs }}>{children}</Provider>
  );
};

export default SongsProvider;
