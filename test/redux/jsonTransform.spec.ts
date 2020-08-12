import jsonTransform from '../../src/redux/store/jsonTransform';

describe('jsonTransform', () => {
  it('transforms cirular json dependencies', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createTransform = (cb1: (...args: any) => any, cb2: (...args: any) => any) => { cb1(); cb2(); return true; };
    const JSOG = { encode: jest.fn(), decode: jest.fn() };
    expect(typeof jsonTransform.makeTransform).toBe('function');
    const ct = jsonTransform.makeTransform(createTransform, JSOG);
    expect(ct).toBe(true);
  });
});
