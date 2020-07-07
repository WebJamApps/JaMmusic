import React from 'react';
import { Song } from '../../redux/mapStoreToProps';
import { Iplayer } from './musicPlayerTypes';

export interface MusicPlayerUtils {
  shuffleThem: (songs: Song[]) => Song[]; toggleSongTypes: (type: string, view: any) => any;
  checkOnePlayer: (params: URLSearchParams, player: Iplayer, view: any) => Promise<boolean>; runIfOnePlayer: (controller: any) => boolean;
  toggleOn: (lcType: string, view: any, type: string, typeInState: string) => any;
  homeButton: (onePlayerMode: boolean) => JSX.Element; share: (view: any) => any; copyShare: (view: any) => any;
  showHideButtons: (display: string) => boolean;
}
const showHideButtons = (display: string): boolean => {
  const mAndP = document.getElementById('mAndP');
  const sb = document.getElementById('share-buttons');
  const pb = document.getElementById('play-buttons');
  try {
    mAndP.style.display = display;
    sb.style.display = display;
    pb.style.display = display;
  } catch (e) { return false; }
  return true;
};
const share = (view: any): void => {
  const { player, player: { displayCopier } } = view.state;
  if (displayCopier === 'none') view.setState({ player: { ...player, displayCopier: 'block' } });
  else view.setState({ player: { ...player, displayCopier: 'none' } });
  showHideButtons('none');
};
const copyShare = (view: any): void => {
  const { player } = view.state;
  view.navigator.clipboard.writeText(view.playUrl()).then(() => {
    view.setState({ player: { ...player, displayCopyMessage: true } });
    setTimeout(() => {
      showHideButtons('block');
      view.setState({ player: { ...player, displayCopier: 'none', displayCopyMessage: false } });
    }, 1500);
  });
};
async function checkOnePlayer(params: { get: (arg0: string) => any; },
  player: Iplayer,
  view: {
    props: { songs: any; };
    setState: (arg0: {
      player: any; song: any;
      index: any; missionState: string; pubState: string;
      originalState: string; songsState: any[];
    }) => void;
  }): Promise<boolean> {
  const { songs } = view.props;
  let missionState = 'off', pubState = 'off', originalState = 'off', newSongs = [];
  if (params.get('oneplayer')) {
    const song = songs.filter((s) => s._id === params.get('id'));
    const index = songs.findIndex((s) => s._id === params.get('id'));
    if (song.length === 0) song.push(songs[0]);
    if (song[0].category === 'mission') { missionState = 'on'; newSongs = songs.filter((s) => s.category === 'mission'); }
    if (song[0].category === 'pub') { pubState = 'on'; newSongs = songs.filter((s) => s.category === 'pub'); }
    if (song[0].category === 'original') { originalState = 'on'; newSongs = songs.filter((s) => s.category === 'original'); }
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

function runIfOnePlayer(controller: { state: { player: { onePlayerMode: any; }; }; }): boolean {
  const { player: { onePlayerMode } } = controller.state;
  if (onePlayerMode) return makeOnePlayerMode();
  return false;
}

const homeButton = (onePlayerMode: any): JSX.Element => (
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
const shuffleThem = (songs: any): any => {
  const shuffled = songs;
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];// eslint-disable-line security/detect-object-injection
  }
  return shuffled;
};
function toggleOn(lcType: string, view: any, type: string, typeInState: string): boolean {
  const { songs } = view.props;
  const { player } = view.state;
  let { songsState, pageTitle } = view.state, shuffled: string[];
  songsState = [
    ...songsState,
    ...songs.filter((song: Song) => song.category === lcType),
  ];
  if (player.isShuffleOn) shuffled = shuffleThem(songsState);
  else { songsState = view.musicUtils.setIndex(songsState, lcType); }
  pageTitle = pageTitle.replace('Songs', '');
  pageTitle += ` & ${type} Songs`;
  view.setState({
    player: { ...player },
    pageTitle,
    songsState: player.isShuffleOn ? shuffled : songsState,
    [typeInState]: 'on',
    song: player.isShuffleOn ? shuffled[0] : songsState[0],
    index: 0,
  });
  return true;
}
function toggleSongTypes(type: string, view: any): boolean {
  const lcType = type.toLowerCase();
  const { player, missionState, pubState } = view.state;
  if (lcType === 'original' && missionState === 'off' && pubState === 'off') return false;
  let { songsState, pageTitle } = view.state, shuffled: string[];
  const { songs } = view.props;
  const typeInState = `${lcType}State`;
  const typeState = view.state[typeInState.toString()]; // eslint-disable-line react/destructuring-assignment
  if (typeState === 'off') return toggleOn(lcType, view, type, typeInState);
  songsState = songsState.filter((song: Song) => song.category !== lcType);
  pageTitle = pageTitle.replace(` & ${type}`, '');
  if (songsState.length === 0) {
    songsState = [
      ...songsState,
      ...songs.filter((song: Song) => song.category === 'original'),
    ];
    pageTitle = 'Original Songs';
    view.setState({ originalState: 'on' });
  }
  pageTitle = pageTitle.replace(`${type}`, '').replace('&', '');
  if (player.isShuffleOn) shuffled = shuffleThem(songsState);
  view.setState({
    player: { ...player },
    pageTitle,
    songsState: player.isShuffleOn ? shuffled : songsState,
    [typeInState]: 'off',
    song: player.isShuffleOn ? shuffled[0] : songsState[0],
    index: 0,
  });
  return true;
}
export default {
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
