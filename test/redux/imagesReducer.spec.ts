import reducer from '../../src/redux/reducers/imagesReducer';

describe('fetch reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {
      type: '',
      data: {
        images: [],
        isFetching: false,
        isError: false,
      },
      error: { message: '' },
    })).toEqual(
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
      reducer(undefined, {
        type: 'FETCH_IMAGES',
        data: {
          images: [],
          isFetching: true,
          isError: false,
        },
        error: { message: '' },
      }),
    ).toEqual(
      {
        images: [],
        isFetching: true,
        isError: false,
        error: '',
      },
    );
  });
  // it('should handle fetched images', () => {
  //   expect(
  //     reducer(undefined, {
  //       type: 'FETCHED_IMAGES',
  //       data: [{}],
  //     }),
  //   ).toEqual(
  //     {
  //       images: [{}],
  //       isFetching: false,
  //       isError: false,
  //       error: '',
  //     },
  //   );
  // });
  it('should handle receive error', () => {
    expect(
      reducer(undefined, {
        type: 'RECEIVE_ERROR',
        data: {
          images: [],
          isFetching: false,
          isError: true,
        },
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
