import scc from 'socketcluster-client';
import type { IGig } from './Data.provider';

export const defaultGig: IGig = {
  date: '',
  time: '',
  tickets: '',
  venue: '',
  location: '',
  id: 0,
  datetime: '',
};

const validateGigsArr = (
  receiver: IteratorResult<any, any>,
  setFunc: (_arg0: IGig[]) => void,
) => {
  let gigsArr = [defaultGig];
  if (Array.isArray(receiver.value)) gigsArr = receiver.value.map((g: IGig, i: number) => ({ ...g, id: i }));
  setFunc(gigsArr);
};

const listenForGigs = (
  socket: scc.AGClientSocket,
  name: string,
  setFunc: (_arg0: IGig[]) => void,
): boolean => {
  (async () => {
    const consumer = socket.receiver(name).createConsumer();
    while (true) { // eslint-disable-line no-constant-condition
      const receiver = await consumer.next();// eslint-disable-line no-await-in-loop
      validateGigsArr(receiver, setFunc);
      socket.disconnect();
      /* istanbul ignore else */if (receiver.done) break;
    }
  })();
  return true;
};

const getGigs = (setGigs: (_arg0: IGig[]) => void): boolean => {
  try {
    const socket = scc.create({
      hostname: process.env.SCS_HOST,
      port: Number(process.env.SCS_PORT),
      autoConnect: true,
      secure: process.env.SOCKETCLUSTER_SECURE !== 'false',
    });
    socket.transmit('initial message', 123);
    return listenForGigs(socket, 'allTours', setGigs);
  } catch (err) { console.log((err as Error).message); return false; }
};

export default { getGigs, listenForGigs, validateGigsArr };
