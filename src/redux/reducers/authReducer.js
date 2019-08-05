const initialState = {
  isAuthenticated: false,
  error: '',
  email: '',
  token: '',
  userCount: 0,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'NUM_USERS': return Object.assign({}, state, { userCount: action.numbUsers });
    case 'GOT_TOKEN':
      console.log(action.data);// eslint-disable-line no-console
      return Object.assign({}, state, {
        isAuthenticated: true,
        email: action.data.email,
        token: action.data.token,
        error: '',
      });
    case 'LOGOUT':
      return Object.assign({}, state, {
        isAuthenticated: false,
        email: '',
        token: '',
        error: '',
      });
    case 'AUTH_ERROR':
      return Object.assign({}, state, {
        isAuthenticated: false,
        email: '',
        token: '',
        error: action.error.message,
      });
    default:
      return state;
  }
};

export default reducer;
