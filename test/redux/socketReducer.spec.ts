import reducer from '../../src/redux/reducers/socketReducer';

describe('socket reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {
      type: '',
      scc: {},
      data: '',
    })).toEqual(
      {
        userCount: 0,
        heartBeat: 'white',
        scc: {},
      },
    );
  });
  it('changes color to white', () => {
    expect(reducer({ heartBeat: 'green', userCount: 0, scc: {} }, { type: 'SC_HEARTBEAT', scc: {}, data: '' })).toEqual(
      {
        userCount: 0,
        heartBeat: 'white',
        scc: {},
      },
    );
  });
  it('changes color to green', () => {
    expect(reducer({ heartBeat: 'white', userCount: 0, scc: {} }, { type: 'SC_HEARTBEAT', scc: {}, data: '' })).toEqual(
      {
        userCount: 0,
        heartBeat: 'green',
        scc: {},
      },
    );
  });
  it('handles SCC', () => {
    expect(reducer(undefined, { type: 'SCC', scc: { id:'23' }, data: '' })).toEqual(
      {
        userCount: 0,
        heartBeat: 'white',
        scc: { id:'23' },
      },
    );
  });
  it('handles NUM_USERS', () => {
    expect(reducer(undefined, { type: 'NUM_USERS', data:'23', scc:{} })).toEqual(
      {
        userCount: 23,
        heartBeat: 'white',
        scc: {},
      },
    );
  });
});
