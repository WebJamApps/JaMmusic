import connectToSC from '../../../src/App/connectToSC';

describe('connectToSC', () => {
  it('sets up scc', async () => {
    const result = await connectToSC.setupSocketCluster(() => {});
    expect(result).toBe(true);
  });
});
