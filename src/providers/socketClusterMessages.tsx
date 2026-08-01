import scc from 'socketcluster-client';
import commonUtils from 'src/lib/utils';

// A dead/unreachable SocketCluster backend fails to connect *asynchronously* —
// scc.create() itself never throws, so wrapping only that call in try/catch
// can't see the failure. Without a bound, an initial message that never gets
// a reply (no data, no error, no connectAbort) hangs forever and the UI just
// sits empty. This timeout guarantees we always tell the visitor something.
// (JaMmusic outage 2026-08-01: webjamsocket crash-looped for ~1.5 days and
// web-jam.com/music silently rendered with no gigs/pictures and no error.)
export const CONNECTION_TIMEOUT_MS = 8000;

const CONNECTION_FAILED_MESSAGE = 'We could not load this content from the server. Please refresh or try again shortly.';

const validateData = (
  receiver: IteratorResult<unknown[]>,
  setFunc: (_arg0: unknown[] | null) => void,
) => {
  let dataArr = null;
  if (Array.isArray(receiver.value)) {
    dataArr = receiver.value.map(
      (g: Record<string, unknown>, i: number) => ({ ...g, id: i }),
    );
  }
  setFunc(dataArr);
};

type DataConsumer = ReturnType<ReturnType<scc.AGClientSocket['receiver']>['createConsumer']>;

const listenForData = (
  socket: scc.AGClientSocket,
  consumer: DataConsumer,
  setFunc: (_arg0: unknown[] | null) => void,
  firstReceiver: IteratorResult<unknown[]>,
): boolean => {
  (async () => {
    let receiver = firstReceiver;
    while (true) { // eslint-disable-line no-constant-condition
      validateData(receiver, setFunc);
      socket.disconnect();
      /* istanbul ignore else */if (receiver.done) break;
      receiver = await consumer.next(); // eslint-disable-line no-await-in-loop
    }
  })();
  return true;
};

type ConnectionOutcome =
  | { kind: 'data'; receiver: IteratorResult<unknown[]> }
  | { kind: 'failed'; reason: string };

// Races the first data message against the async failure signals SocketCluster
// actually emits for an unreachable/crash-looping server ('error', 'connectAbort')
// and a hard timeout, so a hung connection can never fail silently.
const waitForConnection = (
  socket: scc.AGClientSocket,
  consumer: DataConsumer,
): Promise<ConnectionOutcome> => {
  const dataOutcome = consumer.next()
    .then((receiver): ConnectionOutcome => ({ kind: 'data', receiver }));
  const errorOutcome = socket.listener('error').createConsumer().next()
    .then(({ value }): ConnectionOutcome => (
      { kind: 'failed', reason: value?.error?.message || 'socket error' }
    ));
  const abortOutcome = socket.listener('connectAbort').createConsumer().next()
    .then((): ConnectionOutcome => ({ kind: 'failed', reason: 'connect aborted' }));
  const timeoutOutcome = new Promise<ConnectionOutcome>((resolve) => {
    setTimeout(() => resolve({ kind: 'failed', reason: 'timed out' }), CONNECTION_TIMEOUT_MS);
  });
  return Promise.race([dataOutcome, errorOutcome, abortOutcome, timeoutOutcome]);
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
    const consumer = socket.receiver(message).createConsumer();
    (async () => {
      const outcome = await waitForConnection(socket, consumer);
      if (outcome.kind === 'data') {
        listenForData(socket, consumer, setFunc, outcome.receiver);
        return;
      }
      // Two independent signals, on purpose: console for developer diagnosis,
      // notify() for the visitor. Neither alone is enough — the console is
      // invisible to a visitor, and a toast with no logged detail is useless
      // to debug. This pairing is what was missing during the outage.
      console.error(`socketClusterMessages: failed to load "${message}" (${outcome.reason})`); // eslint-disable-line no-console
      commonUtils.notify('Could not load data', CONNECTION_FAILED_MESSAGE, 'danger');
      setFunc(null);
      socket.disconnect();
    })();
    return true;
  } catch (err) { console.log((err as Error).message); return false; } // eslint-disable-line no-console
};

export default { initialMessage, validateData };
