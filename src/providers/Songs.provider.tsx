import React, { createContext, useState, ReactChild } from 'react';
import songData from '../containers/Songs/songs.json';

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

export const SongsContext = createContext({
  test: '',
  songs: songData.songs,
});
type Props = {children: ReactChild};
const SongsProvider = ({ children }: Props): JSX.Element => {
  const { Provider } = SongsContext;
  const [test] = useState('the songs provider has been successfully connected :)');
  const [songs] = useState(songData.songs);
  return (<Provider value={{ test, songs }}>{children}</Provider>
  );
};

export default SongsProvider;
