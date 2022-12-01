
import type { ISong } from 'src/providers/Data.provider';
import type { Iplayer, MusicPlayer } from '.';

const showHideButtons = (display: string): boolean => {
  const mAndP = document.getElementById('mAndP');
  const sb = document.getElementById('share-buttons');
  const pb = document.getElementById('play-buttons');
  if (mAndP) mAndP.style.display = display;
  if (sb) sb.style.display = display;
  if (pb) pb.style.display = display;
  return true;
};
const share = (view: MusicPlayer): void => {
  const { player, player: { displayCopier } } = view.state;
  if (displayCopier === 'none') view.setState({ player: { ...player, displayCopier: 'block' } });
  else view.setState({ player: { ...player, displayCopier: 'none' } });
  showHideButtons('none');
};
function playUrl(song: ISong | null): string {
  const url = window.location.href.split('/music')[0];
  if (song && song._id) return `${url}/music/songs?oneplayer=true&output=embed&id=${song._id}`;
  return `${url}/music/songs`;
}
const copyShare = (
  player: Iplayer,
  song: ISong | null,
  writeText: (arg0: string) => Promise<void>,
  setState: (arg0: { player: Iplayer; }) => void,
): void => {
  // view.navigator.clipboard.writeText(playUrl(song)).then(() => {
  writeText(playUrl(song)).then(() => {
    setState({ player: { ...player, displayCopyMessage: true } });
    setTimeout(() => {
      showHideButtons('block');
      setState({ player: { ...player, displayCopier: 'none', displayCopyMessage: false } });
    }, 1500);
  });
};
async function checkOnePlayer(
  params: URLSearchParams,
  player: Iplayer,
  view: MusicPlayer,
): Promise<boolean> {
  const { songs } = view.props;
  let missionState = 'off', pubState = 'off', originalState = 'off', newSongs: ISong[] = [];
  if (params.get('oneplayer')) {
    const song = songs.filter((s: ISong) => s._id === params.get('id'));
    const index = songs.findIndex((s: ISong) => s._id === params.get('id'));
    if (song.length === 0) song.push(songs[0]);
    if (song[0].category === 'mission') { missionState = 'on'; newSongs = songs.filter((s: ISong) => s.category === 'mission'); }
    if (song[0].category === 'pub') { pubState = 'on'; newSongs = songs.filter((s: ISong) => s.category === 'pub'); }
    if (song[0].category === 'original') { originalState = 'on'; newSongs = songs.filter((s: ISong) => s.category === 'original'); }
    view.setState({
      player: { ...player, onePlayerMode: true },
      song: song[0],
      index: index || 0,
      missionState,
      pubState,
      originalState,
      songsState: newSongs,
    });
    return true;
  }
  return false;
}

const makeOnePlayerMode = (): boolean => {
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

function runIfOnePlayer(view: MusicPlayer): boolean {
  const { player: { onePlayerMode } } = view.state;
  if (onePlayerMode) return makeOnePlayerMode();
  return false;
}

const homeButton = (onePlayerMode: boolean): JSX.Element => (
  <button
    type="button"
    id="h"
    role="menu"
    onClick={() => window.location.assign('/music')}
    style={{ display: onePlayerMode ? 'auto' : 'none' }}
  >
    <span id="homeLink">Home</span>
  </button>
);

const shuffleThem = (songs: ISong[]): ISong[] => {
  const shuffled = songs;
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];// eslint-disable-line security/detect-object-injection
  }
  return shuffled;
};
const resetState = (
  view: MusicPlayer,
  player: Iplayer,
  pageTitle: string,
  songsState: ISong[],
  typeInState: string,
  shuffled: ISong[],
  type: string,
) => {
  view.setState({
    ...view.state,
    player: { ...player },
    pageTitle,
    songsState: player.isShuffleOn ? shuffled : songsState,
    [typeInState]: type,
    song: player.isShuffleOn ? shuffled[0] : songsState[0],
    index: 0,
  });
};
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
function toggleOn(lcType: string, view: MusicPlayer, type: string, typeInState: string): boolean {
  const { player } = view.state;
  let { songsState, pageTitle } = view.state, shuffled: ISong[] = songsState, { songs } = view.props;
  if (!songs) songs = [];
  songsState = [
    ...songsState,
    ...songs.filter((song: ISong) => song.category === lcType),
  ];
  if (player.isShuffleOn) shuffled = shuffleThem(songsState);
  else { songsState = setIndex(songsState, lcType); }
  pageTitle = pageTitle.replace('Songs', '');
  pageTitle += ` & ${type} Songs`;
  resetState(view, player, pageTitle, songsState, typeInState, shuffled, 'on');
  return true;
}
function toggleSongTypes(type: string, view: MusicPlayer): boolean {
  const lcType = type.toLowerCase();
  const { player, missionState, pubState } = view.state;
  if (lcType === 'original' && missionState === 'off' && pubState === 'off') return false;
  let typeState = 'off', { songsState, pageTitle } = view.state, shuffled: ISong[] = songsState, { songs } = view.props;
  if (!songs) songs = [];
  const typeInState = `${lcType}State`;
  if (typeInState === 'pubState') typeState = view.state.pubState;
  else if (typeInState === 'originalState') typeState = view.state.originalState;
  else typeState = view.state.missionState;
  if (typeState === 'off') return toggleOn(lcType, view, type, typeInState);
  songsState = songsState.filter((song: ISong) => song.category !== lcType);
  pageTitle = pageTitle.replace(` & ${type}`, '');
  if (songsState.length === 0) {
    songsState = [...songsState, ...songs.filter((song: ISong) => song.category === 'original')]; pageTitle = 'Original Songs';
    view.setState({ originalState: 'on' });
  }
  pageTitle = pageTitle.replace(`${type}`, '').replace('&', '');
  if (player.isShuffleOn) shuffled = shuffleThem(songsState);
  resetState(view, player, pageTitle, songsState, typeInState, shuffled, 'off');
  return true;
}
function prev(
  index: number,
  songsState: ISong[],
  setState: (arg0: { index: number; song: ISong }) => void,
): void {
  const minusIndex = index - 1;
  if (minusIndex < 0 || minusIndex > songsState.length) {
    const newIndex = songsState.length - 1;
    setState({ index: newIndex, song: songsState[newIndex] });// eslint-disable-line security/detect-object-injection
  } else setState({ song: songsState[minusIndex], index: minusIndex });// eslint-disable-line security/detect-object-injection
}
function setClassOverlay(
  song: ISong | null,
  player: { playing: boolean; },
): string {
  let classOverlay = 'mainPlayer';
  if (player.playing === false) {
    if (song && song.url[8] === 's') classOverlay = 'soundcloudOverlay';
    if (song && song.url[12] === 'y') classOverlay = 'youtubeOverlay';
  }
  return classOverlay;
}
function play(
  player: { playing: boolean; },
  setState: (arg0: { player: any; }) => void,
): void {
  const isPlaying = !player.playing;
  setState({ player: { ...player, playing: isPlaying } });
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
function shuffle(
  player: Iplayer,
  songsState: ISong[],
  missionState: string,
  pubState: string,
  setState: (arg0: { songsState: ISong[]; player: Iplayer; song: ISong; index: number; }
  ) => void,
): void {
  if (player.isShuffleOn) {
    let reset = songsState;
    if (missionState === 'on') reset = setIndex(reset, 'mission');
    if (pubState === 'on') reset = setIndex(reset, 'pub');
    setState({
      songsState: reset, player: { ...player, isShuffleOn: false }, song: reset[0], index: 0,
    });
  } else {
    const shuffled = shuffleThem(songsState);
    setState({
      songsState: shuffled, player: { ...player, isShuffleOn: true }, song: shuffled[0], index: 0,
    });
  }
}
export default {
  shuffle,
  next,
  play,
  playUrl,
  setClassOverlay,
  prev,
  shuffleThem,
  toggleSongTypes,
  checkOnePlayer,
  runIfOnePlayer,
  makeOnePlayerMode,
  homeButton,
  showHideButtons,
  copyShare,
  share,
  toggleOn,
};
