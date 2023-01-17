import { createContext, useState } from 'react';

export interface Iauth {
  isAuthenticated: boolean,
  error: string,
  token: string,
  user: {
    userType: string;
    email: string,
  };
}

// const useAuthState: (arg0: Iauth) =>
// [Iauth, (arg0: Iauth) => void] = createPersistedState('auth', localStorage);

export const defaultAuth: Iauth = {
  isAuthenticated: false,
  error: '',
  token: '',
  user: { userType: '', email: '' },
};

export const defaultSetAuth = (arg0: Iauth) => { console.log(arg0); };

export const AuthContext = createContext({
  auth: defaultAuth,
  setAuth: defaultSetAuth,
});

export function AuthProvider({ children }: any): JSX.Element {
  const { Provider } = AuthContext;
  const [auth, setAuth] = useState(defaultAuth);
  return (<Provider value={{ auth, setAuth }}>{children}</Provider>
  );
}

