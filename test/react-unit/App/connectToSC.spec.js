import connectToSC from '../../../src/App/connectToSC';

describe('connectToSC', () => {
  it('sets up scc', async () => {
    const result = await connectToSC.setupSocketCluster(() => {});
    expect(result).toBe(true);
  });
  // it('connects', () => {
  //   const dispatch = (fun) => {
  //     const fArr = [];
  //     fArr.push(fun.type);
  //     expect(['NUM_USERS', 'SC_HEARTBEAT', 'ALL_TOUR']).toEqual(expect.arrayContaining(fArr));
  //   };
  //   connectToSC.setupSocketCluster(dispatch);
  // });
});
