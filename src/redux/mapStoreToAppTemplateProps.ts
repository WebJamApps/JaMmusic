import { AGClientSocket } from 'socketcluster-client';
import type { Store } from './mapStoreToProps';

interface TStore extends Store {
  sc: { scc: AGClientSocket; userCount: number, heartBeat: string };
}
const mapStoreToProps = (store: TStore): Record<string, unknown> => ({
  songs: store.songs.songs,
  images: store.images.images,
  heartBeat: store.sc.heartBeat,
  userCount: store.sc.userCount,
  auth: store.auth,
});
export default mapStoreToProps;
