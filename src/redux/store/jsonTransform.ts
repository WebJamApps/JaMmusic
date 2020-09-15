import type { createTransform, Transform } from 'redux-persist';
import Flatted from 'flatted';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeTransform = (ctf: typeof createTransform): Transform<unknown, string, any, unknown> => ctf(
  (inboundState) => Flatted.stringify(inboundState),
  (outboundState) => Flatted.stringify(outboundState),
);

export default { makeTransform };
