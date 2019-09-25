import reducer from '../../../src/redux/reducers/socketReducer';

describe('socket reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(
      {
        userCount: 0,
        heartBeat: 'white',
        scc: {},
      },
    );
  });
  it('changes color to white', () => {
    expect(reducer({ heartBeat: 'green', userCount: 0, scc: {} }, { type: 'SC_HEARTBEAT' })).toEqual(
      {
        userCount: 0,
        heartBeat: 'white',
        scc: {},
      },
    );
  });
});
