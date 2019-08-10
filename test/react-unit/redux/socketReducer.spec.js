import reducer from '../../../src/redux/reducers/socketReducer';

describe('socket reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(
      {
        userCount: 0,
        heartBeat: 'white',
      },
    );
  });
  it('changes color to white', () => {
    expect(reducer({ heartBeat: 'green', userCount: 0 }, { type: 'SC_HEARTBEAT' })).toEqual(
      {
        userCount: 0,
        heartBeat: 'white',
      },
    );
  });
});
