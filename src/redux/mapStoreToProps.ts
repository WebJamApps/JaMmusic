import type { AGClientSocket } from 'socketcluster-client';

export interface Store {
  sc: { scc: AGClientSocket; userCount: number };
}

interface MapProps {
  userCount:number;
  scc:AGClientSocket;
}

const mapStoreToProps = (store: Store): MapProps => ({
  userCount: store.sc.userCount,
  scc: store.sc.scc,
});
export default mapStoreToProps;
