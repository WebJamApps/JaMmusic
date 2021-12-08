// import superagent from 'superagent';
import type { IGig } from './Gigs.provider';
import scc from 'socketcluster-client';

export const defaultGig:IGig = {
  date: '',
  time: '',
  tickets: '',
  venue: '',
  location: '',
};

const listenForGigs = (socket: scc.AGClientSocket, name: string, 
  setFunc:(args0:React.SetStateAction<IGig[]>)=>void): void => {
  (async () => {
    const consumer = socket.receiver(name).createConsumer();
    while (true) { // eslint-disable-line no-constant-condition
      const receiver = await consumer.next();// eslint-disable-line no-await-in-loop
      setFunc(receiver.value); socket.disconnect();
      /* istanbul ignore else */if (receiver.done) break;
    }
  })();
};

export const getGigs = async (setGigs: (value: React.SetStateAction<IGig[]>) => void):Promise<void> => {
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

export default { getGigs };
