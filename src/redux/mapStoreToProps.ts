import type { AGClientSocket } from 'socketcluster-client';

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
  showTable: { showTable: boolean };
  image: { editPic: Iimage };
}

interface MapProps {
  images:Iimage[];userCount:number;
  scc:AGClientSocket;
  editPic:Iimage;
  showTable: boolean;
}

const mapStoreToProps = (store: Store): MapProps => ({
  images: store.images.images,
  userCount: store.sc.userCount,
  scc: store.sc.scc,
  editPic: store.image.editPic,
  showTable: store.showTable.showTable,
});
export default mapStoreToProps;
