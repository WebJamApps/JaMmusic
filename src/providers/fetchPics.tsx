// import scc from 'socketcluster-client';
import type { Ipic } from './Data.provider';
import socketClusterMessages from './socketClusterMessages';

// const validatePicsArr = (
//   receiver: IteratorResult<any, any>,
//   setFunc: (_arg0: Ipic[] | null) => void,
// ) => {
//   let picsArr: Ipic[] | null = null;
//   if (Array.isArray(receiver.value)) picsArr = receiver.value.map((p: Ipic, i: number) => ({ ...p, id: i }));
//   setFunc(picsArr);
// };

// const listenForPics = (
//   socket: scc.AGClientSocket,
//   name: string,
//   setFunc: (_arg0: Ipic[] | null) => void,
// ): boolean => {
//   (async () => {
//     const consumer = socket.receiver(name).createConsumer();
//     while (true) { // eslint-disable-line no-constant-condition
//       const receiver = await consumer.next();// eslint-disable-line no-await-in-loop
//       validatePicsArr(receiver, setFunc);
//       socket.disconnect();
//       /* istanbul ignore else */if (receiver.done) break;
//     }
//   })();
//   return true;
// };

const getPics = (setPics: (_arg0: Ipic[] | null) => void): boolean => socketClusterMessages.initialMessage(setPics, 'allBooks');
// try {
//   const socket = scc.create({
//     hostname: process.env.SCS_HOST,
//     port: Number(process.env.SCS_PORT),
//     autoConnect: true,
//     secure: process.env.SOCKETCLUSTER_SECURE !== 'false',
//   });
//   socket.transmit('initial message', 123);
//   return listenForPics(socket, 'allBooks', setPics);
// } catch (err) { console.log((err as Error).message); return false; }

export default { getPics };
