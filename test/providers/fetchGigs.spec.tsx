import scc from 'socketcluster-client';
import fetchGigs, { defaultGig } from 'src/providers/fetchGigs';

describe('fetchGigs', () => {
  it('defaultGig has artist jammusic', () => {
    expect(defaultGig.artist).toBe('jammusic');
  });

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
