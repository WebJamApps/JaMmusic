const makeTransform = (createTransform: (...args: any) => any, JSOG: any) => createTransform(
  (inboundState: any, _key: any) => JSOG.encode(inboundState), // eslint-disable-line @typescript-eslint/no-unused-vars
  (outboundState: any, _key: any) => JSOG.decode(outboundState), // eslint-disable-line @typescript-eslint/no-unused-vars
);

export default { makeTransform };
