const initialState = {
  isAuthenticated: false,
  error: '',
  email: '',
  token: '',
  user: {},
};
const reducer = (state = initialState,
  action: { type: string; data?: { name?: string, email?: string; token?: string; }; error?: { message?: string; }; }): Record<string, unknown> => {
  switch (action.type) {
    case 'GOT_TOKEN':
      // eslint-disable-next-line no-param-reassign
      if (!action.data)action.data = {};
      return {
        ...state, isAuthenticated: true, email: action.data.email || '', token: action.data.token || '', error: '',
      };
    case 'LOGOUT':
      return {
        ...state, isAuthenticated: false, email: '', token: '', error: '', user: {},
      };
    case 'AUTH_ERROR':
      // eslint-disable-next-line no-param-reassign
      if (!action.error)action.error = {};
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
