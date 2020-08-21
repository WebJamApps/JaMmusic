import scc from 'socketcluster-client';
import type { Dispatch } from 'react';

const listenForMessages = (socket: scc.AGClientSocket,
  method: string, name: string, type: string,
  dispatch: Dispatch<unknown>): void => {
  (async () => {
    let receiver;
    const consumer = method === 'subscribe' ? socket.subscribe(name).createConsumer() : socket.receiver(name).createConsumer();
    while (true) { // eslint-disable-line no-constant-condition
      receiver = await consumer.next();// eslint-disable-line no-await-in-loop
      dispatch({ type, data: receiver.value });
      /* istanbul ignore else */if (receiver.done) break;
    }
  })();
};
const connectToSCC = (dispatch: Dispatch<unknown>): boolean => {
  const socket = scc.create({
    hostname: process.env.SCS_HOST,
    port: Number(process.env.SCS_PORT),
    autoConnect: true,
    secure: process.env.SOCKETCLUSTER_SECURE !== 'false',
  });
  dispatch({ type: 'SCC', scc: socket });
  socket.transmit('initial message', 123);
  listenForMessages(socket, 'subscribe', 'tourCreated', 'NEW_TOUR', dispatch);
  listenForMessages(socket, 'subscribe', 'tourUpdated', 'UPDATED_TOUR', dispatch);
  listenForMessages(socket, 'receiver', 'allTours', 'ALL_TOUR', dispatch);
  listenForMessages(socket, 'receiver', 'allBooks', 'FETCHED_IMAGES', dispatch);
  listenForMessages(socket, 'receiver', 'pulse', 'SC_HEARTBEAT', dispatch);
  listenForMessages(socket, 'receiver', 'num_clients', 'NUM_USERS', dispatch);
  listenForMessages(socket, 'subscribe', 'sample', 'NUM_USERS', dispatch);
  return true;
};
export default { connectToSCC, listenForMessages };
