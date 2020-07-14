import { Dispatch } from 'react';
import { Song } from '../redux/mapStoreToProps';
import songData from './songs.json';

export const gotSongs = (songs: Song[]): { type: string, data: Song[] } => ({
  type: 'GOT_SONGS',
  data: songs,
});

const getSongs = () => (dispatch: Dispatch<unknown>): boolean => {
  const { songs } = songData;
  if (window.location.href.includes('http:')) {
    for (let i = 0; i < songs.length; i += 1) { // eslint-disable-next-line security/detect-object-injection
      if (songs[i].url.includes('https://www.youtube')) {
        // eslint-disable-next-line security/detect-object-injection
        songs[i].url = songs[i].url.replace('https://www.youtube:', 'http://www.youtube:');
        // eslint-disable-next-line security/detect-object-injection
        songs[i].url = songs[i].url.replace('https://web-jam.com', `http://localhost:${process.env.PORT}`);
      }
    }
  }
  dispatch(gotSongs(songs));
  return true;
};
export default getSongs;
