/* eslint-disable @typescript-eslint/no-explicit-any */
import reducer from '../../src/redux/reducers/imagesReducer';

describe('fetch reducer', () => {
  it('returns the initial state', () => {
    expect(reducer(undefined, {
      type: '',
    })).toEqual(
      {
        images: [],
        isFetching: false,
        isError: false,
        error: '',
      },
    );
  });
  it('handles fetch images', () => {
    expect(
      reducer(undefined, {
        type: 'FETCH_IMAGES',
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
  it('handles FETCHED_IMAGES', () => {
    const testImage:any = { _id:'testid' };
    const newState: any = reducer(undefined, {
      type: 'FETCHED_IMAGES',
      data: [testImage],
    },
    );
    expect(newState.images[0]._id).toBe('testid');
  });
  it('handles RECEIVE_ERROR', () => {
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
  it('handles RECEIVE_ERROR when unknown error', () => {
    expect(
      reducer(undefined, {
        type: 'RECEIVE_ERROR',
      }),
    ).toEqual(
      {
        images: [],
        isFetching: false,
        isError: true,
        error: 'unknown error',
      },
    );
  });
});
