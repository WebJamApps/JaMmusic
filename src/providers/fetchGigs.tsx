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

const listenForMessages = (socket: scc.AGClientSocket,
  method: string, name: string, setFunc:any): void => {
  (async () => {
    let receiver;
    const consumer = method === 'subscribe' ? socket.subscribe(name).createConsumer() : socket.receiver(name).createConsumer();
    while (true) { // eslint-disable-line no-constant-condition
      receiver = await consumer.next();// eslint-disable-line no-await-in-loop
      if (receiver.value){setFunc(receiver.value); socket.disconnect();}
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
  listenForMessages(socket, 'receiver', 'allTours', setGigs);
  // let res:{ body:ISong[] }, newSongs:ISong[] = [];
  // if (!window.location.href.includes('8888') && !window.location.href.includes('joshandmariamusic')){
  //   try {
  //     res = await superagent.get(`${process.env.BackendUrl}/song`).set('Accept', 'application/json');
  //   } catch (e) { console.log((e as Error).message); return [defaultSong]; }
  //   newSongs = res.body;
  //   try {
  //     newSongs.sort((a, b) => b.year - a.year);
  //   } catch (error) { console.log(error); newSongs = []; }
  //   setSongs(newSongs);
  // }
  // return newSongs;
};

export default { getGigs };
