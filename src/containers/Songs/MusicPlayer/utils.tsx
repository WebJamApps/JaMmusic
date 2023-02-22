import type ReactPlayer from 'react-player';
import commonUtils from 'src/lib/commonUtils';
import type { Isong } from 'src/providers/Data.provider';

function setPlayerStyle(song: Isong): Record<string, unknown> {
  let playerStyle = {
    backgroundColor: '#2a2a2a',
    textAlign: 'center',
    backgroundImage: song.image ? `url(${song.image})` : '',
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
  searchParams: URLSearchParams,
  setters: {
    setSongsState: (arg0: any) => void,
    setIndex: (arg0: number) => void,
    setIsSingle: (arg0: boolean) => void,
  },
  // setPlaying: (arg0: boolean) => void, // issue 886
) {
  const { setSongsState, setIndex, setIsSingle } = setters;
  const id = searchParams.get('id');
  const newSongs = typeof id === 'string' ? songs : songs.filter((song: { category?: string }) => song.category === category);
  setSongsState(newSongs);
  if (typeof id === 'string') {
    setIsSingle(true);
    const songIds = newSongs.map((s) => s._id);
    const songIndex = songIds.indexOf(id);
    setIndex(songIndex);
    // setPlaying(true); issue 886
  }
}

const makeSingleSong = (isSingle: boolean): boolean => {
  if (!isSingle) return false;
  const sidebar = document.getElementById('sidebar');
  const header = document.getElementById('header');
  const footer = document.getElementById('wjfooter');
  const toggler = document.getElementById('mobilemenutoggle');
  const contentBlock = document.getElementById('contentBlock');
  const pageContent = document.getElementById('pageContent');
  const headerTitle = document.getElementById('headerTitle');
  const mainPlayer = document.getElementById('mainPlayer');
  if (sidebar) sidebar.style.display = 'none';
  if (header) header.style.display = 'none';
  if (footer) footer.style.display = 'none';
  if (toggler) toggler.style.display = 'none';
  if (headerTitle) headerTitle.style.display = 'none';
  if (contentBlock) {
    contentBlock.style.overflowY = 'auto';
    contentBlock.style.width = '100%';
    contentBlock.style.height = '100%';
    contentBlock.style.marginTop = '0px';
  }
  if (mainPlayer && window.outerWidth < 600) mainPlayer.style.height = '55vh';
  if (pageContent) pageContent.style.borderColor = '#fff';
  return true;
};

function play(playing: boolean, setPlaying: (arg0: boolean) => void): void {
  setPlaying(!playing);
}

function next(index: number, songsState: Isong[], setIndex: (arg0: number) => void): void {
  const nextIndex = index + 1;
  if (nextIndex >= songsState.length) {
    setIndex(0);
  } else {
    setIndex(nextIndex);
  }
}

function prev(index: number, songsState: Isong[], setIndex: (arg0: number) => void): void {
  const minusIndex = index - 1;
  if (minusIndex < 0 || minusIndex > songsState.length) {
    const newIndex = songsState.length - 1;
    setIndex(newIndex);
  } else setIndex(minusIndex);
}

const handlePlayerError = (err: any) => {
  // eslint-disable-next-line no-console
  console.log(err); return err;
};

const handlePlayerReady = (player:ReactPlayer) => { console.log(player); return player; };

export default {
  makeSingleSong,
  copyShare,
  initSongs,
  setPlayerStyle,
  play,
  next,
  prev,
  handlePlayerError,
  handlePlayerReady,
};
