import React from 'react';

const showHideButtons = (display) => {
  const mAndP = document.getElementById('mAndP');
  if (mAndP !== null) {
    mAndP.style.display = display;
    return true;
  }
  return false;
};
const share = (controller) => {
  const { player, player: { displayCopier } } = controller.state;
  if (displayCopier === 'none') controller.setState({ player: { ...player, displayCopier: 'block' } });
  else controller.setState({ player: { ...player, displayCopier: 'none' } });
  showHideButtons('none');
};
const copyShare = (controller) => {
  const { player } = controller.state;
  controller.navigator.clipboard.writeText(controller.playUrl()).then(() => {
    controller.setState({ player: { ...player, displayCopyMessage: true } });
    setTimeout(() => {
      showHideButtons('block');
      controller.setState({ player: { ...player, displayCopier: 'none', displayCopyMessage: false } });
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

export default {
  checkOnePlayer, runIfOnePlayer, makeOnePlayerMode, homeButton, showHideButtons, copyShare, share,
};
