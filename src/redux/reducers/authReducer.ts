import type { Auth } from '../mapStoreToProps';

const initialState = {
  isAuthenticated: false,
  error: '',
  email: '',
  token: '',
  user: { userType: '' },
};
const reducer = (
  state: Auth,
  action: { type: string; data?: { name?: string, email?: string; token?: string; userType?:string }; error?: { message?: string; }; },
): Record<string, unknown> => {
  if (!state) state = initialState;
  const data = action.data || { email: '', token: '' };
  const error = action.error || {};
  switch (action.type) {
    case 'GOT_TOKEN':
      return {
        ...state, isAuthenticated: true, email: data.email, token: data.token, error: '',
      };
    case 'LOGOUT':
      return initialState;
    case 'AUTH_ERROR':
      return {
        ...initialState, error: error.message,
      };
    case 'SET_USER':
      return { ...state, user: action.data };
    default:
      return initialState;
  }
};

export default reducer;
