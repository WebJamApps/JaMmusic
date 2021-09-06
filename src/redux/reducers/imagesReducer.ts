import type { Iimage } from '../mapStoreToProps';

const initialState = {
  images: [],
  isFetching: false,
  isError: false,
  error: '',
};

const imagesReducer = (state = initialState, action: { type: string, data?: Iimage[], error?: { message: string } }): Record<string, unknown> => {
  switch (action.type) {
    case 'FETCH_IMAGES':
      return {
        ...state,
        isFetching: true,
        images: [],
        isError: false,
      };
    case 'FETCHED_IMAGES':
      return {
        ...state,
        images: action.data,
        isFetching: false,
        isError: false,
      };
    case 'RECEIVE_ERROR':
      return {
        ...state,
        isError: true,
        isFetching: false,
        error: action.error ? action.error.message : 'unknown error',
      };
    default:
      return state;
  }
};

export default imagesReducer;
