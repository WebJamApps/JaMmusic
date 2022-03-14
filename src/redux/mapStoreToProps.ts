import type { AGClientSocket } from 'socketcluster-client';
import type { ISong } from '../providers/Data.provider';

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
  'caption': string;
  'thumbnail': string | undefined;
  'link': string;
  'modify': JSX.Element | undefined;
  'comments': string;
  'created_at'?: string;
  'updated_at'?: string;
}
export interface Store {
  sc: { scc: AGClientSocket; userCount: number };
  images: { images: Iimage[] };
  auth: Auth;
  tour: { tour: Tour[]; tourUpdated: boolean; editTour: Tour; editSong: ISong };
  showTable: { showTable: boolean };
  image: { editPic: Iimage };
}

interface MapProps {
  images:Iimage[];userCount:number;auth:Auth;tour:Tour[];
  scc:AGClientSocket;tourUpdated:boolean;editTour:Tour;editSong:ISong;editPic:Iimage;
  showTable: boolean;
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
    editPic: store.image.editPic,
    showTable: store.showTable.showTable,
  });
};
export default mapStoreToProps;
