import fetchGigs, { defaultGig } from '../../src/providers/fetchGigs';

describe('fetchGigs', () => {
  it('getGigs runs setGigs', () => {
    const setGigs = jest.fn();
    expect(fetchGigs.getGigs(setGigs)).toBe(true);
  });
  it('validateGigsArr', () => {
    const setGigs = jest.fn();
    fetchGigs.validateGigsArr({ value: [defaultGig, defaultGig] }, setGigs);
    expect(setGigs).toHaveBeenCalled();
  });
});
