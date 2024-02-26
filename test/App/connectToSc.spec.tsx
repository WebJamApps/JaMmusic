import connectToSC from 'src/App/connectToSC';

describe('connectToSC', () => {
  it('connectToSCC successfully', () => {
    const dispatch = jest.fn();
    const result = connectToSC.connectToSCC(dispatch);
    expect(result).toBe(true);
  });
});
