import scc from 'socketcluster-client';
import fetchGigs, { defaultGig } from 'src/providers/fetchGigs';

describe('fetchGigs', () => {
  it('getGigs runs successfully', () => {
    const setGigs = jest.fn();
    expect(fetchGigs.getGigs(setGigs)).toBe(true);
  });
  it('getGigs catches error', () => {
    scc.create = jest.fn(() => { throw new Error('failed'); });
    const setGigs = jest.fn();
    expect(fetchGigs.getGigs(setGigs)).toBe(false);
  });
  it('validateGigsArr', () => {
    const setGigs = jest.fn();
    fetchGigs.validateGigsArr({ value: [defaultGig, defaultGig] }, setGigs);
    expect(setGigs).toHaveBeenCalled();
  });
});
