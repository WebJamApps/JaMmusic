/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const create = (options: any): any => {
  console.log(options);// eslint-disable-line no-console
  return {
    subscribe: () => ({ createConsumer: () => ({ next: () => Promise.resolve({ value: 1, done: true }) }) }),
    receiver: () => ({ createConsumer: () => ({ next: () => Promise.resolve({ value: 'connected', done: true }) }) }),
    // Default mock never signals a connection failure, so the data path always
    // wins the race in socketClusterMessages.tsx unless a test overrides this.
    listener: () => ({ createConsumer: () => ({ next: () => new Promise(() => { /* never resolves */ }) }) }),
    transmit: () => { },
    disconnect: () => {},
  };
};
export default { create };
