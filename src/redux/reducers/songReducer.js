const initialState = {
  songs: [],
  error: '',
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GOT_SONGS':
      // console.log(action.data);// eslint-disable-line no-console
      return Object.assign({}, state, {
        songs: action.data,
        error: '',
      });
    // case 'LOGOUT':
    //   return Object.assign({}, state, {
    //     isAuthenticated: false,
    //     email: '',
    //     token: '',
    //     error: '',
    //   });
    // case 'AUTH_ERROR':
    //   return Object.assign({}, state, {
    //     isAuthenticated: false,
    //     email: '',
    //     token: '',
    //     error: action.error.message,
    //   });
    default:
      return state;
  }
};

export default reducer;
