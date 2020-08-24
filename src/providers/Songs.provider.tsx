import React, {
  createContext, useState, ReactChild, useEffect,
} from 'react';
import superagent from 'superagent';

export interface ISong {
  artist?: string;
  composer?: string;
  category: string;
  album?: string;
  year?: number;
  image?: string;
  title: string;
  url: string;
  _id: string;
}

export const defaultSong = {
  category: '', title: '', url: '', _id: '',
};

export const fetchSongs = async ():Promise<ISong[]> => {
  let res:{body:ISong[]};
  try {
    res = await superagent.get(`${process.env.BackendUrl}/song`).set('Accept', 'application/json');
  // eslint-disable-next-line no-console
  } catch (e) { console.log(e.message); return [defaultSong]; }
  return res.body;
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
