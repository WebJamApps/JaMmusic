/// <reference types="vitest/globals" />

import 'vitest';

declare module 'vitest' {
  // Must mirror vitest's own `Assertion<T = any>` type parameter exactly.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> {
    toHaveNoViolations(): T;
  }
}
