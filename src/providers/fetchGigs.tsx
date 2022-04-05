import type { IGig } from './Data.provider';
import scc from 'socketcluster-client';

export const defaultGig: IGig = {
  date: '',
  time: '',
  tickets: '',
  venue: '',
  location: '',
  id: 0,
  datetime: '',
};

const validateGigsArr = (receiver: IteratorResult<any, any>,
  setFunc: (_arg0: IGig[]) => void) => {
  let gigsArr = [defaultGig];
  if (Array.isArray(receiver.value)) gigsArr = receiver.value.map((g: IGig, i: number) => ({ ...g, id: i }));
  setFunc(gigsArr);
};

const listenForGigs = (socket: scc.AGClientSocket, name: string,
  setFunc: (_arg0: IGig[]) => void): void => {
  (async () => {
    const consumer = socket.receiver(name).createConsumer();
    while (true) { // eslint-disable-line no-constant-condition
      const receiver = await consumer.next();// eslint-disable-line no-await-in-loop
      validateGigsArr(receiver, setFunc);
      socket.disconnect();
      /* istanbul ignore else */if (receiver.done) break;
    }
  })();
};

const getGigs = async (setGigs: (_arg0: IGig[]) => void): Promise<void> => {
  const socket = scc.create({
    hostname: process.env.SCS_HOST,
    port: Number(process.env.SCS_PORT),
    autoConnect: true,
    secure: process.env.SOCKETCLUSTER_SECURE !== 'false',
  });
  socket.transmit('initial message', 123);
  console.log('getGigs');
  listenForGigs(socket, 'allTours', setGigs);
};

export default { getGigs, listenForGigs, validateGigsArr };
