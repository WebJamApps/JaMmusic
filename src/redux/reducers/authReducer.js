const initialState = {
  isAuthenticated: false,
  error: '',
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GOT_TOKEN':
      console.log(action.data);// eslint-disable-line no-console
      return Object.assign({}, state, {
        isAuthenticated: true,
      });
    case 'AUTH_ERROR':
      return Object.assign({}, state, {
        isAuthenticated: false,
        error: action.error.message,
      });
    default:
      return state;
  }
};

export default reducer;
