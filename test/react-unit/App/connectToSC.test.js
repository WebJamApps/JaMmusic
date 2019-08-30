import connectToSC from '../../../src/App/connectToSC';

describe('connectToSC', () => {
  it('connects', () => {
    const dispatch = (fun) => {
      const fArr = [];
      fArr.push(fun.type);
      expect(['NUM_USERS', 'SC_HEARTBEAT', 'ALL_TOUR']).toEqual(expect.arrayContaining(fArr));
    };
    connectToSC.setupSocketCluster(dispatch);
  });
});
