const checkOnePlayer = (params, player, songs, allSongs, controller) => {
  if (params.get('oneplayer')) {
    const song = allSongs.filter(s => s._id === params.get('id'));
    const index = allSongs.findIndex(s => s._id === params.get('id'));
    return controller.setState({ player: { ...player, onePlayerMode: true }, song: song.length ? song[0] : songs[0], index: index || 0 });
  }
  return controller.setState({ song: songs[0], index: 0 });
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
  if (contentBlock) contentBlock.style.overflowY = 'auto';
  if (contentBlock) contentBlock.style.width = '100%';
  if (contentBlock) contentBlock.style.height = '100%';
  if (window.outerWidth < 600) mainPlayer.style.height = '55vh';
  if (pageContent) pageContent.style.borderColor = '#fff';
};

const runIfOnePlayer = (controller) => {
  const { player: { onePlayerMode } } = controller.state;
  if (onePlayerMode) return makeOnePlayerMode();
  return null;
};

export default { checkOnePlayer, runIfOnePlayer, makeOnePlayerMode };
