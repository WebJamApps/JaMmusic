import processPolyfill from 'process/browser';
import { Buffer as BufferPolyfill } from 'buffer';

(globalThis as unknown as { process: typeof processPolyfill }).process = processPolyfill;
(globalThis as unknown as { Buffer: typeof BufferPolyfill }).Buffer = BufferPolyfill;
