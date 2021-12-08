import fetchGigs from '../../src/providers/fetchGigs';

describe('fetchGigs', () => {
  it('getGigs runs setGigs', async () => {
    const setGigs = jest.fn();
    await fetchGigs.getGigs(setGigs);
    expect(setGigs).toHaveBeenCalled();
  });
});
