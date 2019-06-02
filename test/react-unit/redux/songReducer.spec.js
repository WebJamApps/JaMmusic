import reducer from '../../../src/redux/reducers/songReducer';

describe('auth reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(
      {
        songs: [],
        error: '',
      },
    );
  });
  it('handles GOT_SONGS', () => {
    expect(reducer(undefined, { type: 'GOT_SONGS', data: [{ _id: '123' }] })).toEqual(
      {
        songs: [{ _id: '123' }],
        error: '',
      },
    );
  });
});
