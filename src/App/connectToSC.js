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
  // sccOld.on('random', (data) => dispatch({ type: 'SC_HEARTBEAT', data }));
  sccOld.on('allTours', (data) => dispatch({ type: 'ALL_TOUR', data }));
  dispatch({ type: 'SCC', sccOld });
  return Promise.resolve(true);
};
const connectToSCC = (dispatch) => {
  const socket = scc.create({
    hostname: process.env.SCS_HOST,
    port: process.env.SCS_PORT,
    autoConnect: true,
    secure: process.env.SOCKETCLUSTER_SECURE !== 'false',
  });
  socket.transmit('initial message', 123);
  (async () => {
    let receiver;
    const rConsumer = socket.receiver('pulse').createConsumer();
    while (true) { // eslint-disable-line no-constant-condition
      receiver = await rConsumer.next();// eslint-disable-line no-await-in-loop
      dispatch({ type: 'SC_HEARTBEAT', data: receiver.value });
      /* istanbul ignore else */if (receiver.done) break;
    }
  })();
  return Promise.resolve(true);
};
export default { setupSocketCluster, connectToSCC }; // emits when a style was updated or created
