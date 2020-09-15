import jsonTransform from '../../src/redux/store/jsonTransform';

describe('jsonTransform', () => {
  it('transforms cirular json dependencies', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createTransform:any = (cb1: () => void, cb2: () => void) => { cb1(); cb2(); return true; };
    expect(typeof jsonTransform.makeTransform).toBe('function');
    const ct = jsonTransform.makeTransform(createTransform);
    expect(ct).toBe(true);
  });
});
