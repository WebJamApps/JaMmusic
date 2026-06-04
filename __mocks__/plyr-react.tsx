import { forwardRef } from 'react';

// Plyr instantiates a real player (and loads an icon sprite via URL) which fails
// under jsdom. Stub it as a ref-forwarding component that renders nothing.
export const Plyr = forwardRef<unknown, Record<string, unknown>>(() => null);

export default { Plyr };
