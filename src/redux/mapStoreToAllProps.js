const mapStoreToProps = (store) => ({
  songs: store.songs.songs,
  images: store.images.images,
  heartBeat: store.sc.heartBeat,
  userCount: store.sc.userCount,
  auth: store.auth,
});
export default mapStoreToProps;
