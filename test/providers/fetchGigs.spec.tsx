import scc from 'socketcluster-client';
import fetchGigs from 'src/providers/fetchGigs';

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
});
