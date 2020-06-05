import React from 'react';

const showHideButtons = (display: string) => {
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
const share = (view: any) => {
  const { player, player: { displayCopier } } = view.state;
  if (displayCopier === 'none') view.setState({ player: { ...player, displayCopier: 'block' } });
  else view.setState({ player: { ...player, displayCopier: 'none' } });
  showHideButtons('none');
};
const copyShare = (view: any) => {
  const { player } = view.state;
  view.navigator.clipboard.writeText(view.playUrl()).then(() => {
    view.setState({ player: { ...player, displayCopyMessage: true } });
    setTimeout(() => {
      showHideButtons('block');
      view.setState({ player: { ...player, displayCopier: 'none', displayCopyMessage: false } });
    }, 1500);
  });
};
const checkOnePlayer = async (params, player, view) => {
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
};

const makeOnePlayerMode = () => {
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

const runIfOnePlayer = (controller) => {
  const { player: { onePlayerMode } } = controller.state;
  if (onePlayerMode) return makeOnePlayerMode();
  return null;
};

const homeButton = (onePlayerMode) => (
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
const shuffleThem = (songs) => {
  const shuffled = songs;
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];// eslint-disable-line security/detect-object-injection
  }
  return shuffled;
};
function toggleOn(lcType: string, view: any, type: string, typeInState: string) {
  const { songs } = view.props;
  const { player } = view.state;
  let { songsState, pageTitle } = view.state, shuffled: any[];
  songsState = [
    ...songsState,
    ...songs.filter((song: any) => song.category === lcType),
  ];
  if (player.isShuffleOn) shuffled = shuffleThem(songsState);
  else { songsState = view.musicUtils.setIndex(songsState, lcType); }
  pageTitle = pageTitle.replace('Songs', '');
  pageTitle += ` & ${type} Songs`;
  return view.setState({
    player: { ...player },
    pageTitle,
    songsState: player.isShuffleOn ? shuffled : songsState,
    [typeInState]: 'on',
    song: player.isShuffleOn ? shuffled[0] : songsState[0],
    index: 0,
  });
}
function toggleSongTypes(type: string, view: any) {
  const lcType = type.toLowerCase();
  const { player, missionState, pubState } = view.state;
  if (lcType === 'original' && missionState === 'off' && pubState === 'off') return false;
  let { songsState, pageTitle } = view.state, shuffled: any[];
  const { songs } = view.props;
  const typeInState = `${lcType}State`;
  const typeState = view.state[typeInState.toString()]; // eslint-disable-line react/destructuring-assignment
  if (typeState === 'off') return toggleOn(lcType, view, type, typeInState);
  songsState = songsState.filter((song: any) => song.category !== lcType);
  pageTitle = pageTitle.replace(` & ${type}`, '');
  if (songsState.length === 0) {
    songsState = [
      ...songsState,
      ...songs.filter((song: any) => song.category === 'original'),
    ];
    pageTitle = 'Original Songs';
    view.setState({ originalState: 'on' });
  }
  pageTitle = pageTitle.replace(`${type}`, '').replace('&', '');
  if (player.isShuffleOn) shuffled = shuffleThem(songsState);
  return view.setState({
    player: { ...player },
    pageTitle,
    songsState: player.isShuffleOn ? shuffled : songsState,
    [typeInState]: 'off',
    song: player.isShuffleOn ? shuffled[0] : songsState[0],
    index: 0,
  });
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
