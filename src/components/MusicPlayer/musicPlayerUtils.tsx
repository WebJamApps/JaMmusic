import React from 'react';

const showHideButtons = (display: string) => {
  const mAndP = document.getElementById('mAndP');
  if (mAndP !== null) {
    mAndP.style.display = display;
    return true;
  }
  return false;
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
const checkOnePlayer = (params, player, controller) => {
  const { songs } = controller.props;
  if (params.get('oneplayer')) {
    const song = songs.filter((s) => s._id === params.get('id'));
    const index = songs.findIndex((s) => s._id === params.get('id'));
    controller.setState({ player: { ...player, onePlayerMode: true }, song: song.length ? song[0] : songs[0], index: index || 0 });
    return Promise.resolve(true);
  }
  return Promise.resolve(false);
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
