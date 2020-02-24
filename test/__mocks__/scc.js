export const create = (options) => { // eslint-disable-line import/prefer-default-export
  console.log(options);// eslint-disable-line no-console
  return {
    receiver: () => ({ createConsumer: () => ({ next: () => Promise.resolve({ value: 'connected', done: true }) }) }),
    transmit: () => {},
  };
};
export default { create };
