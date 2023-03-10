import {
  createContext, useEffect, useRef, useState,
} from 'react';

const usePersistedState = (name: string, defaultValue: string) => {
  const initValue = localStorage.getItem(name);
  const [value, setValue] = useState(initValue || defaultValue);
  const nameRef = useRef(name);

  useEffect(() => {
    try {
      const storedValue = localStorage.getItem(name);
      if (storedValue !== null) setValue(storedValue);
      else localStorage.setItem(name, defaultValue);
    } catch {
      setValue(defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(nameRef.current, value);
    } catch (err) { console.log((err as Error).message); }
  }, [value]);

  useEffect(() => {
    const lastName = nameRef.current;
    if (name !== lastName) {
      try {
        localStorage.setItem(name, value);
        nameRef.current = name;
        localStorage.removeItem(lastName);
      } catch (err) { console.log((err as Error).message); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return [value, setValue];
};

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

export function AuthProvider({ children }: any): JSX.Element {
  const { Provider } = AuthContext;
  const [authString, setAuthString] = usePersistedState('auth', JSON.stringify(defaultAuth));
  let auth = defaultAuth, setAuth = defaultSetAuth;
  try {
    auth = JSON.parse(authString as string);
    const setter: (arg0: string) => void = setAuthString as (arg0: string) => void;
    setAuth = (arg0: Iauth) => { setter(JSON.stringify(arg0)); };
  } catch (err) { console.log((err as Error).message); }
  return (<Provider value={{ auth, setAuth }}>{children}</Provider>
  );
}

