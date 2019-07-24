import socketCluster from 'socketcluster-client';

const setupSocketCluster = (dispatch) => {
  // console.log(dispatch);// eslint-disable-line no-console
  const scc = socketCluster.create({
    hostname: process.env.SOCKETCLUSTER_HOST,
    port: process.env.SOCKETCLUSTER_PORT,
    autoConnect: true,
  });
  scc.on('connect', () => {
    const count = scc.subscribe('sample');// eslint-disable-next-line security/detect-non-literal-fs-filename
    count.watch((numbUsers) => {
      console.log(`number of users: ${numbUsers}`);// eslint-disable-line no-console
      dispatch({ type: 'NUM_USERS', numbUsers });
    });
    console.log(`socketClusterClient connected on port ${process.env.SOCKETCLUSTER_PORT}`);// eslint-disable-line no-console
    scc.emit('sampleClientEvent', 'howdy');
  });
  // scc.on('random', (data) => {
  //   // console.log(`socket heartbeat: ${data.number}`); // eslint-disable-line no-console
  // });
};
export default { setupSocketCluster }; // emits when a style was updated or created
