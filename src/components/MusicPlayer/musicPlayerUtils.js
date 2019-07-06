const checkOnePlayer = (params, player, songs, allSongs, controller) => {
  if (params.get('oneplayer')) {
    const song = allSongs.filter(s => s._id === params.get('id'));
    const index = allSongs.findIndex(s => s._id === params.get('id'));
    return controller.setState({ player: { ...player, onePlayerMode: true }, song: song.length ? song[0] : songs[0], index: index || 0 });
  }
  return controller.setState({ song: songs[0], index: 0 });
};

export default { checkOnePlayer };
