import commonUtils from 'src/lib/commonUtils';
import type { Isong } from 'src/providers/Data.provider';

// const sortSongs = (songs: Isong[], category: string): Isong[] => {
//   let categorySongs: Isong[] = [];
//   const otherSongs: Isong[] = [];
//   for (let i = 0; songs.length > i; i += 1) {
//     // eslint-disable-next-line security/detect-object-injection
//     if (songs[i].category === category) categorySongs.push(songs[i]);
//     else otherSongs.push(songs[i]);// eslint-disable-line security/detect-object-injection
//   }
//   categorySongs = categorySongs.concat(otherSongs);
//   return categorySongs;
// };

function setPlayerStyle(song: Isong):Record<string, unknown> {
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

function copyShare() {
  // Get the text field
  const copyText = document.getElementById('copyUrl') as HTMLInputElement;

  // Select the text field
  copyText.select();
  copyText.setSelectionRange(0, 99999); // For mobile devices

  // Copy the text inside the text field
  navigator.clipboard.writeText(copyText.value);
  commonUtils.notify('A shareable song url has been copied to your clipboard', '', 'success');
}

function initSongs(
  songs: Isong[],
  category: string,
  setSongsState: (arg0: any) => void,
  searchParams: any,
  setPlaying: (arg0: boolean) => void,
  setIndex: (arg0: number) => void,
) {
  const id = searchParams.get('id');
  const newSongs = typeof id === 'string' ? songs : songs.filter((song: { category?: string }) => song.category === category);
  setSongsState(newSongs);
  if (typeof id === 'string') {
    const songIds = newSongs.map((s) => s._id);
    const songIndex = songIds.indexOf(id);
    setIndex(songIndex);
    setPlaying(true);
  }
}

export default {
  // sortSongs,
  copyShare,
  initSongs,
  // copyRight,
  setPlayerStyle,
};
