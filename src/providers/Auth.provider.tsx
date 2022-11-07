import { createContext, ReactChild } from 'react';
import createPersistedState from 'use-persisted-state';

export interface Iauth {
  isAuthenticated: boolean,
  error: string,
  token: string,
  user: {
    userType: string;
    email: string,
  };
}

const useAuthState: (arg0: Iauth) =>
[Iauth, (arg0: Iauth) => void] = createPersistedState('auth', localStorage);

export const defaultAuth: Iauth = {
  isAuthenticated: false,
  error: '',
  token: '',
  user: {
    userType: '',
    email: '',
  },
};

export const AuthContext = createContext({
  auth: defaultAuth,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setAuth: (_arg0: Iauth) => {},
});

type Props = { children: ReactChild };
export function AuthProvider({ children }: Props): JSX.Element {
  const { Provider } = AuthContext;
  const [auth, setAuth] = useAuthState(defaultAuth);
  return (<Provider value={{ auth, setAuth }}>{children}</Provider>
  );
}

