export const create = (options) => { // eslint-disable-line import/prefer-default-export
  console.log(options);// eslint-disable-line no-console
  return {
    subscribe: () => ({ createConsumer: () => ({ next: () => Promise.resolve({ value: 1, done: true }) }) }),
    receiver: () => ({ createConsumer: () => ({ next: () => Promise.resolve({ value: 'connected', done: true }) }) }),
    transmit: () => {},
  };
};
export default { create };
