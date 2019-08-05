export const create = (options) => { // eslint-disable-line import/prefer-default-export
  console.log(options);// eslint-disable-line no-console
  const aU = {
    watch: (func) => { func(); },
  };
  return {
    subscribe: () => aU,
    connect: () => {},
    emit: () => {},
    on: (name, func) => {
      if (name === 'errorHandler') func({ message: 'bad' });
      else if (name !== null && name !== undefined) func();
    },
  };
};
export default { create };
