const initialState = {
  isAuthenticated: false,
  error: '',
  email: '',
  token: '',
  user: {},
};
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GOT_TOKEN':
      return {
        ...state, isAuthenticated: true, email: action.data.email, token: action.data.token, error: '',
      };
    case 'LOGOUT':
      return {
        ...state, isAuthenticated: false, email: '', token: '', error: '', user: {},
      };
    case 'AUTH_ERROR':
      return {
        ...state, isAuthenticated: false, email: '', token: '', error: action.error.message, user: {},
      };
    case 'SET_USER':
      return { ...state, user: action.data };
    default:
      return state;
  }
};

export default reducer;
