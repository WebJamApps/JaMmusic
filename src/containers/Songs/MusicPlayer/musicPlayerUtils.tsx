
import type { Isong } from 'src/providers/Data.provider';
// import type { Iplayer } from '.';

const showHideButtons = (display: string): boolean => {
  const mAndP = document.getElementById('mAndP');
  const sb = document.getElementById('share-buttons');
  const pb = document.getElementById('play-buttons');
  if (mAndP) mAndP.style.display = display;
  if (sb) sb.style.display = display;
  if (pb) pb.style.display = display;
  return true;
};
// const share = (view: MusicPlayer): void => {
//   const { player, player: { displayCopier } } = view.state;
//   if (displayCopier === 'none') view.setState({ player: { ...player, displayCopier: 'block' } });
//   else view.setState({ player: { ...player, displayCopier: 'none' } });
//   showHideButtons('none');
// };
// const copyShare = (player): void => {
//   view.navigator.clipboard.writeText(view.playUrl()).then(() => {
//     view.setState({ player: { ...player, displayCopyMessage: true } });
//     setTimeout(() => {
//       showHideButtons('block');
//       view.setState({ player: { ...player, displayCopier: 'none', displayCopyMessage: false } });
//     }, 1500);
//   });
// };
// async function checkOnePlayer(
//   params: URLSearchParams,
//   player: Iplayer,
//   view: MusicPlayer,
// ): Promise<boolean> {
//   const { songs } = view.props;
//   let missionState = 'off', pubState = 'off', originalState = 'off', newSongs: Isong[] = [];
//   if (params.get('oneplayer')) {
//     const song = songs.filter((s: Isong) => s._id === params.get('id'));
//     const index = songs.findIndex((s: Isong) => s._id === params.get('id'));
//     if (song.length === 0) song.push(songs[0]);
//     if (song[0].category === 'mission') { missionState = 'on'; newSongs = songs.filter((s: Isong) => s.category === 'mission'); }
//     if (song[0].category === 'pub') { pubState = 'on'; newSongs = songs.filter((s: Isong) => s.category === 'pub'); }
//     if (song[0].category === 'original') { originalState = 'on'; newSongs = songs.filter((s: Isong) => s.category === 'original'); }
//     view.setState({
//       player: { ...player, onePlayerMode: true },
//       song: song[0],
//       index: index || 0,
//       missionState,
//       pubState,
//       originalState,
//       songsState: newSongs,
//     });
//     return true;
//   }
//   return false;
// }

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

// function runIfOnePlayer(view: MusicPlayer): boolean {
//   const { player: { onePlayerMode } } = view.state;
//   if (onePlayerMode) return makeOnePlayerMode();
//   return false;
// }

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

const shuffleThem = (songs: Isong[]): Isong[] => {
  const shuffled = songs;
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];// eslint-disable-line security/detect-object-injection
  }
  return shuffled;
};
// const resetState = (
//   view: MusicPlayer,
//   player: Iplayer,
//   pageTitle: string,
//   songsState: Isong[],
//   typeInState: string,
//   shuffled: Isong[],
//   type:string,
// ) => {
//   view.setState({
//     ...view.state,
//     player: { ...player },
//     pageTitle,
//     songsState: player.isShuffleOn ? shuffled : songsState,
//     [typeInState]: type,
//     song: player.isShuffleOn ? shuffled[0] : songsState[0],
//     index: 0,
//   });
// };
// function toggleOn(lcType: string, view: MusicPlayer, type: string, typeInState: string): boolean {
//   const { player } = view.state;
//   let { songsState, pageTitle } = view.state, shuffled: Isong[] = songsState, { songs } = view.props;
//   if (!songs) songs = [];
//   songsState = [
//     ...songsState,
//     ...songs.filter((song: Isong) => song.category === lcType),
//   ];
//   if (player.isShuffleOn) shuffled = shuffleThem(songsState);
//   else { songsState = view.musicUtils.setIndex(songsState, lcType); }
//   pageTitle = pageTitle.replace('Songs', '');
//   pageTitle += ` & ${type} Songs`;
//   resetState(view, player, pageTitle, songsState, typeInState, shuffled, 'on');
//   return true;
// }
// function toggleSongTypes(
//   type: string,
//   player: { isShuffleOn: any; },
//   missionState: string,
//   pubState: string,
//   originalState: string,
//   songsState: any[],
//   pageTitle: string,
//   songs: any[],
// ): boolean {
//   const lcType = type.toLowerCase();
//   // const { player, missionState, pubState } = view.state;
//   if (lcType === 'original' && missionState === 'off' && pubState === 'off') return false;
//   let typeState = 'off', shuffled: Isong[] = songsState;
//   if (!songs) songs = [];
//   const typeInState = `${lcType}State`;
//   if (typeInState === 'pubState') typeState = pubState;
//   else if (typeInState === 'originalState') typeState = originalState;
//   else typeState = missionState;
//   // if (typeState === 'off') return toggleOn(lcType, type, typeInState);
//   songsState = songsState.filter((song: Isong) => song.category !== lcType);
//   pageTitle = pageTitle.replace(` & ${type}`, '');
//   if (songsState.length === 0) {
//     songsState = [...songsState, ...songs.filter((song: Isong) => song.category === 'original')]; pageTitle = 'Original Songs';
//     // view.setState({ originalState: 'on' });
//   }
//   pageTitle = pageTitle.replace(`${type}`, '').replace('&', '');
//   if (player.isShuffleOn) shuffled = shuffleThem(songsState);
//   // resetState(view, player, pageTitle, songsState, typeInState, shuffled, 'off');
//   return true;
// }

// function configClassOverlay(song: any, player: any): string {
//   let classOverlay = 'mainPlayer';
//   if (player.playing === false) {
//     if (song !== null && song !== undefined && song.url[8] === 's') classOverlay = 'soundcloudOverlay';
//     if (song !== null && song !== undefined && song.url[12] === 'y') classOverlay = 'youtubeOverlay';
//   }
//   return classOverlay;
// }
export default {
  // prev,
  shuffleThem,
  // toggleSongTypes,
  // checkOnePlayer,
  // runIfOnePlayer,
  makeOnePlayerMode,
  homeButton,
  showHideButtons,
  // copyShare,
  // share,
  // toggleOn,
};
