import type { createTransform, Transform } from 'redux-persist';
import type jsog from 'jsog';

const makeTransform = (ctf: typeof createTransform,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  JSOG: typeof jsog): Transform<unknown, unknown, any, unknown> => ctf(
  (inboundState) => JSOG.encode(inboundState),
  (outboundState) => JSOG.decode(outboundState),
);

export default { makeTransform };
