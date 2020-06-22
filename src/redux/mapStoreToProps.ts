export interface Song {
  title: string;
  artist?: string;
  composer?: string;
  category: string;
  album?: string;
  year?: string;
  url: string;
  _id: string;
}
export interface Store {
  sc: {scc: any; userCount: number};
  songs: {songs: Song[]};
  images: {images: any[]};
  auth: any;
  tour: {tour: any[]; tourUpdated: boolean; editTour: any};
}
const mapStoreToProps = (store: Store): any => ({
  songs: store.songs.songs,
  images: store.images.images,
  userCount: store.sc.userCount,
  auth: store.auth,
  tour: store.tour.tour,
  scc: store.sc.scc,
  tourUpdated: store.tour.tourUpdated,
  editTour: store.tour.editTour,
});
export default mapStoreToProps;
