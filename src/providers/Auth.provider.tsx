import {
  createContext, useEffect,
} from 'react';
import superagent from 'superagent';
import jwt from 'jwt-simple';
import { usePersistedState } from 'src/lib/usePersistedState';

export interface Iauth {
  isAuthenticated: boolean,
  error: string,
  token: string,
  user: {
    userType: string;
    email: string,
  };
}

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

export const configAuth = (authString: string, setAuthString: (arg0: string) => void) => {
  let auth = defaultAuth, setAuth = defaultSetAuth;
  try {
    auth = JSON.parse(authString);
    const setter: (arg0: string) => void = setAuthString as (arg0: string) => void;
    setAuth = (arg0: Iauth) => { setter(JSON.stringify(arg0)); };
  } catch (err) { console.log((err as Error).message); }
  return { auth, setAuth };
};

export const setUserAuth = async (
  token: string,
  userId: string | undefined,
  setAuthType: (arg0: string | Iauth) => void,
  type: 'setAuth' | 'setAuthString',
) => {
  try {
    const { body } = await superagent.get(`${process.env.BackendUrl}/user/${userId}`)
      .set('Accept', 'application/json').set('Authorization', `Bearer ${token}`);
    if (type === 'setAuthString') {
      setAuthType(JSON.stringify({
        error: '', isAuthenticated: true, token, user: body,
      }));
    } else {
      setAuthType({
        error: '', isAuthenticated: true, token, user: body,
      });
    }
  } catch (err) { // if there is an error, reset auth to initial state
    if (type === 'setAuthString') { setAuthType(JSON.stringify(defaultAuth)); } else {
      setAuthType(defaultAuth);
    }
  }
};

export function AuthProvider({ children }: any): JSX.Element {
  const { Provider } = AuthContext;
  const [authString, setAuthString] = usePersistedState('auth', JSON.stringify(defaultAuth));
  useEffect(() => {
    (async () => {
      if (typeof authString === 'string') {
        try {
          const auth = JSON.parse(authString);
          const { token } = auth;
          const { sub } = jwt.decode(token, process.env.HashString as string);
          await setUserAuth(token, sub, setAuthString as (arg0: any) => void, 'setAuthString');
        } catch (err) { (setAuthString as React.Dispatch<React.SetStateAction<string>>)(JSON.stringify(defaultAuth)); }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { auth, setAuth } = configAuth(
    authString as string,
    setAuthString as React.Dispatch<React.SetStateAction<string>>,
  );
  return (<Provider value={{ auth, setAuth }}>{children}</Provider>
  );
}
