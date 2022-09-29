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
  action: { type: string; token?:string, data?: { name?: string, email?: string; token?: string; userType?:string }; error?: { message?: string; }; },
): Record<string, unknown> => {
  if (!state) state = initialState;
  const error = action.error || {};
  switch (action.type) {
    case 'LOGOUT':
      return initialState;
    case 'AUTH_ERROR':
      return {
        ...initialState, error: error.message,
      };
    case 'SET_USER':
      return {
        error: '', isAuthenticated: true, email: action.data?.email, token: action.token, user: action.data,
      };
    default:
      return initialState;
  }
};

export default reducer;
