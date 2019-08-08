const mapStoreToProps = store => ({
  songs: store.songs.songs,
  images: store.images.images,
});
export default mapStoreToProps;
