import type { Mock, MockInstance, vi } from 'vitest';

declare global {
  // Compat shim: existing tests reference `jest.fn()`, `jest.spyOn()`, `jest.Mock`, etc.
  // Runtime is set up via globalThis.jest = vi in test/vitest.setup.ts.
  const jest: typeof vi;
  namespace jest {
    type Mock<TArgs extends unknown[] = unknown[], TReturn = unknown> = ReturnType<typeof vi.fn<TArgs, TReturn>>;
    type SpyInstance<TReturn = unknown, TArgs extends unknown[] = unknown[]> = MockInstance<TArgs, TReturn>;
    type Mocked<T> = {
      [K in keyof T]: T[K] extends (...args: infer A) => infer R ? Mock<A, R> : T[K];
    };
  }
}

export {};
