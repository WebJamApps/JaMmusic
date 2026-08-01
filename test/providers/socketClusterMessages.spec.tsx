import { waitFor } from '@testing-library/react';
import socketClusterMessages, { CONNECTION_TIMEOUT_MS } from 'src/providers/socketClusterMessages';
import scc from 'socketcluster-client';
import commonUtils from 'src/lib/utils';

const neverResolves = () => new Promise(() => { /* server never replies */ });

describe('socketClusterMessages', () => {
  afterEach(() => {
    // Restore the baseline fake-timer config set up globally in
    // test/vitest.setup.ts, in case a test in this file swapped it out.
    vi.useFakeTimers({ now: 1483228800000, toFake: ['Date'] });
  });

  it('validateData when it is an array', () => {
    let dataArr = null;
    const setFunc = jest.fn((d) => { dataArr = d; });
    const receiver = { value: [{}] };
    socketClusterMessages.validateData(receiver, setFunc);
    expect(Array.isArray(dataArr)).toBeTruthy();
  });

  it('initialMessage success path is unchanged: data resolves, setFunc gets it, socket disconnects', async () => {
    const disconnect = jest.fn();
    const dataNext = jest.fn().mockResolvedValue({ value: [{ a: 1 }], done: true });
    const receiver = jest.fn(() => ({ createConsumer: () => ({ next: dataNext }) }));
    const listener = jest.fn(() => ({ createConsumer: () => ({ next: neverResolves }) }));
    const transmit = jest.fn();
    scc.create = jest.fn(() => ({
      transmit, receiver, listener, disconnect,
    })) as any;
    const setFunc = jest.fn();

    const result = socketClusterMessages.initialMessage(setFunc, 'allGigs');

    expect(result).toBe(true);
    await waitFor(() => expect(setFunc).toHaveBeenCalledWith([{ a: 1, id: 0 }]));
    expect(disconnect).toHaveBeenCalled();
  });

  it('initialMessage success path keeps streaming subsequent messages on the same consumer (unchanged)', async () => {
    const disconnect = jest.fn();
    const dataNext = jest.fn()
      .mockResolvedValueOnce({ value: [{ a: 1 }], done: false })
      .mockResolvedValueOnce({ value: [{ b: 2 }], done: true });
    const receiver = jest.fn(() => ({ createConsumer: () => ({ next: dataNext }) }));
    const listener = jest.fn(() => ({ createConsumer: () => ({ next: neverResolves }) }));
    const transmit = jest.fn();
    scc.create = jest.fn(() => ({
      transmit, receiver, listener, disconnect,
    })) as any;
    const setFunc = jest.fn();

    socketClusterMessages.initialMessage(setFunc, 'allGigs');

    await waitFor(() => expect(setFunc).toHaveBeenCalledWith([{ b: 2, id: 0 }]));
    expect(setFunc).toHaveBeenCalledWith([{ a: 1, id: 0 }]);
    expect(disconnect).toHaveBeenCalledTimes(2);
  });

  it('initialMessage surfaces an async "error" event as a user-visible failure instead of hanging silently', async () => {
    commonUtils.notify = jest.fn();
    const disconnect = jest.fn();
    const receiver = jest.fn(() => ({ createConsumer: () => ({ next: neverResolves }) }));
    const errorNext = jest.fn().mockResolvedValue({ value: { error: new Error('connect ECONNREFUSED 10.0.0.1:8000') }, done: false });
    const listener = jest.fn((eventName: string) => ({
      createConsumer: () => ({ next: eventName === 'error' ? errorNext : neverResolves }),
    }));
    const transmit = jest.fn();
    scc.create = jest.fn(() => ({
      transmit, receiver, listener, disconnect,
    })) as any;
    const setFunc = jest.fn();

    const result = socketClusterMessages.initialMessage(setFunc, 'allGigs');

    expect(result).toBe(true);
    await waitFor(() => expect(commonUtils.notify).toHaveBeenCalled());
    expect(commonUtils.notify).toHaveBeenCalledWith(
      'Could not load data',
      expect.any(String),
      'danger',
    );
    const visitorMessage = (commonUtils.notify as ReturnType<typeof jest.fn>).mock.calls[0][1] as string;
    // The visitor-facing message must never leak the raw error, host, or port.
    expect(visitorMessage).not.toMatch(/ECONNREFUSED|10\.0\.0\.1|8000/);
    expect(setFunc).toHaveBeenCalledWith(null);
    expect(disconnect).toHaveBeenCalled();
  });

  it('initialMessage surfaces a "connectAbort" as a user-visible failure', async () => {
    commonUtils.notify = jest.fn();
    const disconnect = jest.fn();
    const receiver = jest.fn(() => ({ createConsumer: () => ({ next: neverResolves }) }));
    const abortNext = jest.fn().mockResolvedValue({ value: { code: 4001, reason: 'refused' }, done: false });
    const listener = jest.fn((eventName: string) => ({
      createConsumer: () => ({ next: eventName === 'connectAbort' ? abortNext : neverResolves }),
    }));
    const transmit = jest.fn();
    scc.create = jest.fn(() => ({
      transmit, receiver, listener, disconnect,
    })) as any;
    const setFunc = jest.fn();

    socketClusterMessages.initialMessage(setFunc, 'allGigs');

    await waitFor(() => expect(commonUtils.notify).toHaveBeenCalled());
    expect(setFunc).toHaveBeenCalledWith(null);
    expect(disconnect).toHaveBeenCalled();
  });

  it('initialMessage times out and surfaces a failure when the server never responds at all (JaMmusic outage 2026-08-01)', async () => {
    vi.useFakeTimers({ now: 1483228800000, toFake: ['Date', 'setTimeout'] });
    commonUtils.notify = jest.fn();
    const disconnect = jest.fn();
    const receiver = jest.fn(() => ({ createConsumer: () => ({ next: neverResolves }) }));
    const listener = jest.fn(() => ({ createConsumer: () => ({ next: neverResolves }) }));
    const transmit = jest.fn();
    scc.create = jest.fn(() => ({
      transmit, receiver, listener, disconnect,
    })) as any;
    const setFunc = jest.fn();

    const result = socketClusterMessages.initialMessage(setFunc, 'allGigs');
    expect(result).toBe(true);

    // Nothing should have fired yet — this is exactly the silent-hang defect:
    // no data, no error, no connectAbort, and (before the fix) no timeout either.
    expect(commonUtils.notify).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(CONNECTION_TIMEOUT_MS);

    expect(commonUtils.notify).toHaveBeenCalledWith(
      'Could not load data',
      expect.any(String),
      'danger',
    );
    expect(setFunc).toHaveBeenCalledWith(null);
    expect(disconnect).toHaveBeenCalled();
  });
});
