/// <reference types="vitest/globals" />

import 'vitest';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
  // Must mirror vitest's own `Assertion<R, T>` type parameters in Vitest 5.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<R = void, T = any> extends TestingLibraryMatchers<T, R> {
    toHaveNoViolations(): R;
  }
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, unknown> {}
}
