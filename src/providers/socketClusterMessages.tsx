import scc from 'socketcluster-client';

const validateData = (
  receiver: IteratorResult<any, any>,
  setFunc: (_arg0: any[] | null) => void,
) => {
  let gigsArr = null;
  if (Array.isArray(receiver.value)) {
    gigsArr = receiver.value.map(
      (g: any, i: number) => ({ ...g, id: i }),
    );
  }
  setFunc(gigsArr);
};

const listenForData = (
  socket: scc.AGClientSocket,
  message: string,
  setFunc: (_arg0: any[] | null) => void,
): boolean => {
  (async () => {
    const consumer = socket.receiver(message).createConsumer();
    while (true) { // eslint-disable-line no-constant-condition
      const receiver = await consumer.next();// eslint-disable-line no-await-in-loop
      validateData(receiver, setFunc);
      socket.disconnect();
      /* istanbul ignore else */if (receiver.done) break;
    }
  })();
  return true;
};

const initialMessage = (setFunc: (arg0: any[] | null) => void, message: string) => {
  try {
    const socket = scc.create({
      hostname: process.env.SCS_HOST,
      port: Number(process.env.SCS_PORT),
      autoConnect: true,
      secure: process.env.SOCKETCLUSTER_SECURE !== 'false',
    });
    socket.transmit('initial message', 123);
    return listenForData(socket, message, setFunc);
  } catch (err) { console.log((err as Error).message); return false; }
};

export default { initialMessage };
