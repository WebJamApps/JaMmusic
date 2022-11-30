
import type { ISong } from 'src/providers/Data.provider';

const setIndex = (songs: ISong[], category: string): ISong[] => {
  let categorySongs: ISong[] = [];
  const otherSongs: ISong[] = [];
  for (let i = 0; songs.length > i; i += 1) {
    // eslint-disable-next-line security/detect-object-injection
    if (songs[i].category === category) categorySongs.push(songs[i]);
    else otherSongs.push(songs[i]);// eslint-disable-line security/detect-object-injection
  }
  categorySongs = categorySongs.concat(otherSongs);
  return categorySongs;
};

function setPlayerStyle(song: ISong):Record<string, unknown> {
  let playerStyle = {
    backgroundColor: '#2a2a2a',
    textAlign: 'center',
    backgroundImage: `url(${song.image})`,
    backgroundPosition: 'center',
    backgroundSize: '80%',
    backgroundRepeat: 'no-repeat',
  };
  if (song.image === undefined || song.image === '') {
    playerStyle = {
      backgroundImage: 'url("/static/imgs/webjamlogo1.png")',
      backgroundColor: '#2a2a2a',
      textAlign: 'center',
      backgroundPosition: 'center',
      backgroundSize: '80%',
      backgroundRepeat: 'no-repeat',
    };
    if (song.url[8] === 's' || song.url[12] === 'y') {
      playerStyle = {
        backgroundImage: '',
        backgroundColor: '#eee',
        textAlign: 'center',
        backgroundPosition: 'center',
        backgroundSize: '80%',
        backgroundRepeat: 'no-repeat',
      };
    }
  }
  return playerStyle;
}

function next(
  index: number,
  songsState: ISong[],
  setState: (arg0: { index: number; song: ISong; }) => void,
): void {
  const newIndex = index + 1;
  if (newIndex >= songsState.length) setState({ index: 0, song: songsState[0] });
  else setState({ song: songsState[index], index });// eslint-disable-line security/detect-object-injection
}

export default {
  next,
  setIndex,
  setPlayerStyle,
};
