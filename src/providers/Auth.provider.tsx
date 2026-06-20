import React, {
  createContext, useEffect,
} from 'react';
import { usePersistedState } from 'src/lib/usePersistedState';
import { isTokenExpired, getTokenSub } from 'src/lib/tokenExpiry';

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
    const res = await fetch(`${process.env.BackendUrl}/user/${userId}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const body = await res.json();
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

// Given the persisted auth string, return the reset auth-string to store when
// the token has expired, or null when no logout is needed (JaMmusic#1121).
export function expiredAuthReset(authString: string): string | null {
  try {
    const { token } = JSON.parse(authString);
    if (token && isTokenExpired(token)) return JSON.stringify(defaultAuth);
  } catch { /* no / unparseable auth — nothing to expire */ }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { Provider } = AuthContext;
  const [authString, setAuthString] = usePersistedState('auth', JSON.stringify(defaultAuth));
  useEffect(() => {
    (async () => {
      if (typeof authString === 'string') {
        try {
          const auth = JSON.parse(authString);
          const { token } = auth;
          const sub = getTokenSub(token);
          if (!sub) throw new Error('token has no subject');
          await setUserAuth(token, sub, setAuthString as (arg0: string | Iauth) => void, 'setAuthString');
        } catch (err) { (setAuthString as React.Dispatch<React.SetStateAction<string>>)(JSON.stringify(defaultAuth)); }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Proactively log out the moment the token's exp passes — not only on reload
  // (JaMmusic#1121). Runs immediately and every minute while the app is open.
  useEffect(() => {
    const checkExpiry = () => {
      const reset = expiredAuthReset(authString as string);
      if (reset) (setAuthString as React.Dispatch<React.SetStateAction<string>>)(reset);
    };
    checkExpiry();
    const id = window.setInterval(checkExpiry, 60000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authString]);
  const { auth, setAuth } = configAuth(
    authString as string,
    setAuthString as React.Dispatch<React.SetStateAction<string>>,
  );
  return (<Provider value={{ auth, setAuth }}>{children}</Provider>
  );
}
