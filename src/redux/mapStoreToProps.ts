export interface Auth {
  isAuthenticated: boolean,
  error: string,
  email: string,
  token: string,
  user: {
    userType: string;
  };
}
export interface Song {
  artist?: string;
  composer?: string;
  category: string;
  album?: string;
  year?: number;
  image?: string;
  title: string;
  url: string;
  _id: string;
}

export interface Tour {
  modify?:JSX.Element,
  datetime?: string;
  more?: string;
  date: string;
  time: string;
  tickets: string;
  venue: string;
  location: string;
  _id: string;
}
export interface Iimage {
  '_id': string;
  'url': string;
  'title': string;
  'type': string;
  'created_at': string;
  'updated_at': string;
}
export interface Store {
  sc: { scc: any; userCount: number };
  songs: { songs: Song[] };
  images: { images: any[] };
  auth: Auth;
  tour: { tour: any[]; tourUpdated: boolean; editTour: any };
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
