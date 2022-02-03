const initialState = {
  isAuthenticated: false,
  error: '',
  email: '',
  token: '',
  user: {},
};
// eslint-disable-next-line @typescript-eslint/default-param-last
const reducer = (state = initialState,
  action: { type: string; data?: { name?: string, email?: string; token?: string; }; error?: { message?: string; }; }): Record<string, unknown> => {
  const data = action.data || { email: '', token: '' };
  const error = action.error || {};
  switch (action.type) {
    case 'GOT_TOKEN':
      return {
        ...state, isAuthenticated: true, email: data.email, token: data.token, error: '',
      };
    case 'LOGOUT':
      return {
        ...state, isAuthenticated: false, email: '', token: '', error: '', user: {},
      };
    case 'AUTH_ERROR':
      return {
        ...state, isAuthenticated: false, email: '', token: '', error: error.message, user: {},
      };
    case 'SET_USER':
      return { ...state, user: action.data };
    default:
      return state;
  }
};

export default reducer;
