const initialState = {
  images: [],
  isFetching: false,
  isError: false,
  error: '',
};

const fetchReducers = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_IMAGES':
      return Object.assign({}, state, {
        isFetching: true,
        images: [],
        isError: false,
      });
    case 'FETCHED_IMAGES':
      return Object.assign({}, state, {
        images: action.data,
        isFetching: false,
        isError: false,
      });
    case 'RECEIVE_ERROR':
      return Object.assign({}, state, {
        isError: true,
        isFetching: false,
        error: action.error.message,
      });
    default:
      return state;
  }
};

export default fetchReducers;
