import socketCluster from 'socketcluster-client';

const setupSocketCluster = (dispatch) => {
  const scc = socketCluster.create({
    hostname: process.env.SOCKETCLUSTER_HOST,
    port: process.env.SOCKETCLUSTER_PORT,
    autoConnect: true,
    secure: process.env.SOCKETCLUSTER_SECURE !== 'false',
    // secure: false,
  });
  scc.on('connect', () => {
    const count = scc.subscribe('sample');// eslint-disable-next-line security/detect-non-literal-fs-filename
    count.watch((numbUsers) => {
      console.log(`number of users: ${numbUsers}`);// eslint-disable-line no-console
      dispatch({ type: 'NUM_USERS', numbUsers });
    });
    const newTour = scc.subscribe('tourCreated');// eslint-disable-next-line security/detect-non-literal-fs-filename
    newTour.watch((data) => {
      console.log('tourCreated');//eslint-disable-line
      console.log(data);//eslint-disable-line
      // counter += 1;
      // if (counter === 1) {
      return dispatch({ type: 'NEW_TOUR', data });
      // }
      // counter = 0;
      // return null;
    });
    console.log(`socketClusterClient connected on port ${process.env.SOCKETCLUSTER_PORT}`);// eslint-disable-line no-console
    scc.emit('sampleClientEvent', 'howdy');
    scc.emit('getTours');
  });
  scc.on('random', (data) => {
    dispatch({ type: 'SC_HEARTBEAT', data });
  });
  scc.on('allTours', (data) => {
    dispatch({ type: 'ALL_TOUR', data });
  });
  dispatch({ type: 'SCC', scc });
  return Promise.resolve(true);
};
export default { setupSocketCluster }; // emits when a style was updated or created
