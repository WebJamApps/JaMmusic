import connectToSC from '../../../src/App/connectToSC';

describe('connectToSC', () => {
  it('connects', () => {
    const dispatch = (fun) => { expect(fun.type).toBe('NUM_USERS'); };
    connectToSC.setupSocketCluster(dispatch);
  });
});
