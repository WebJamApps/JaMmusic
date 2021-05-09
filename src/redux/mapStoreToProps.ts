import type { AGClientSocket } from 'socketcluster-client';
import type { ISong } from '../providers/Songs.provider';

export interface Auth {
  isAuthenticated: boolean,
  error: string,
  email: string,
  token: string,
  user: {
    userType: string;
  };
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
  _id?: string;
}
export interface Iimage {
  '_id'?: string;
  'url': string;
  'title': string;
  'type': string;
  'caption': string | undefined;
  'created_at'?: string;
  'updated_at'?: string;
}
export interface Store {
  sc: { scc: AGClientSocket; userCount: number };
  images: { images: Iimage[] };
  auth: Auth;
  tour: { tour: Tour[]; tourUpdated: boolean; editTour: Tour; editSong: ISong };
}

interface MapProps {
  images:Iimage[];userCount:number;auth:Auth;tour:Tour[];
  scc:AGClientSocket;tourUpdated:boolean;editTour:Tour;editSong:ISong
}

// eslint-disable-next-line arrow-body-style
const mapStoreToProps = (store: Store): MapProps => {
  // console.log(store);
  return ({
    images: store.images.images,
    userCount: store.sc.userCount,
    auth: store.auth,
    tour: store.tour.tour,
    scc: store.sc.scc,
    tourUpdated: store.tour.tourUpdated,
    editTour: store.tour.editTour,
    editSong: store.tour.editSong,
  });
};
export default mapStoreToProps;
