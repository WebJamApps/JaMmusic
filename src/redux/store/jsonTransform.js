const makeTransform = (createTransform, JSOG) => createTransform(
  (inboundState, key) => JSOG.encode(inboundState), // eslint-disable-line no-unused-vars
  (outboundState, key) => JSOG.decode(outboundState), // eslint-disable-line no-unused-vars
);

export default { makeTransform };
