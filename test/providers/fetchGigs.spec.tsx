import fetchGigs, { defaultGig } from '../../src/providers/fetchGigs';

describe('fetchGigs', () => {
  it('getGigs runs setGigs', async () => {
    const setGigs = jest.fn();
    await fetchGigs.getGigs(setGigs);
    expect(setGigs).toHaveBeenCalled();
  });
  it('validateGigsArr', ()=>{
    const setGigs = jest.fn();
    fetchGigs.validateGigsArr({ value:[defaultGig, defaultGig] }, setGigs);
    expect(setGigs).toHaveBeenCalled();
  });
});
