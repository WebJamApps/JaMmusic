import socketCluster from 'socketcluster-client';
import scc from 'scc';

const setupSocketCluster = (dispatch) => {
  const sccOld = socketCluster.create({
    hostname: process.env.SOCKETCLUSTER_HOST,
    port: process.env.SOCKETCLUSTER_PORT,
    autoConnect: true,
    secure: process.env.SOCKETCLUSTER_SECURE !== 'false',
  });
  sccOld.on('connect', () => {
    const count = sccOld.subscribe('sample');// eslint-disable-next-line security/detect-non-literal-fs-filename
    count.watch((numbUsers) => dispatch({ type: 'NUM_USERS', numbUsers }));
    const newTour = sccOld.subscribe('tourCreated');// eslint-disable-next-line security/detect-non-literal-fs-filename
    newTour.watch((data) => dispatch({ type: 'NEW_TOUR', data }));
    console.log(`socketClusterClient connected on port ${process.env.SOCKETCLUSTER_PORT}`);// eslint-disable-line no-console
    sccOld.emit('sampleClientEvent', 'howdy');
    sccOld.emit('getTours');
  });
  sccOld.on('random', (data) => dispatch({ type: 'SC_HEARTBEAT', data }));
  sccOld.on('allTours', (data) => dispatch({ type: 'ALL_TOUR', data }));
  dispatch({ type: 'SCC', sccOld });
  return Promise.resolve(true);
};
const connectToSCC = () => {
  const socket = scc.create({
    hostname: 'localhost',
    port: 8888,
  });
  socket.transmit('howdy', 123);
  return Promise.resolve(true);
};
export default { setupSocketCluster, connectToSCC }; // emits when a style was updated or created
