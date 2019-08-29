const mapStoreToProps = (store) => ({
  songs: store.songs.songs,
  images: store.images.images,
  userCount: store.sc.userCount,
  auth: store.auth,
  tour: store.tour.tour,
});
export default mapStoreToProps;
