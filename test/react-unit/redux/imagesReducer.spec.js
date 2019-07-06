import reducer from '../../../src/redux/reducers/imagesReducer';

describe('fetch reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(
      {
        images: [],
        isFetching: false,
        isError: false,
        error: '',
      },
    );
  });
  it('should handle fetch images', () => {
    expect(
      reducer(undefined, { type: 'FETCH_IMAGES' }),
    ).toEqual(
      {
        images: [],
        isFetching: true,
        isError: false,
        error: '',
      },
    );
  });
  it('should handle fetched images', () => {
    expect(
      reducer(undefined, {
        type: 'FETCHED_IMAGES',
        data: [{}],
      }),
    ).toEqual(
      {
        images: [{}],
        isFetching: false,
        isError: false,
        error: '',
      },
    );
  });
  it('should handle receive error', () => {
    expect(
      reducer(undefined, {
        type: 'RECEIVE_ERROR',
        error: { message: 'bad' },
      }),
    ).toEqual(
      {
        images: [],
        isFetching: false,
        isError: true,
        error: 'bad',
      },
    );
  });
});
