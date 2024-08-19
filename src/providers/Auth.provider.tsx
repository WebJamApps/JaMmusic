import {
  createContext, MutableRefObject, useEffect, useRef, useState,
} from 'react';
import superagent from 'superagent';
import jwt from 'jwt-simple';

export const setInitValue = (
  name: string,
  setValue: React.Dispatch<React.SetStateAction<string>>,
  defaultValue: string,
) => {
  try {
    const storedValue = localStorage.getItem(name);
    if (typeof storedValue === 'string') setValue(storedValue);
    else localStorage.setItem(name, defaultValue);
  } catch {
    setValue(defaultValue);
  }
};

export const handleValueChange = (
  current: string,
  value: string,
) => {
  try {
    localStorage.setItem(current, value);
    return value;
  } catch (err) {
    const eMessage = (err as Error).message;
    console.log(eMessage); return eMessage;
  }
};

export const handleNameChange = (
  nameRef: MutableRefObject<string>,
  name: string,
  value: string,
) => {
  const lastName = nameRef.current;
  if (name !== lastName) {
    try {
      localStorage.setItem(name, value);
      nameRef.current = name;
      localStorage.removeItem(lastName);
      return name;
    } catch (err) {
      const eMessage = (err as Error).message;
      console.log(eMessage); return eMessage;
    }
  }
  return '';
};

const usePersistedState = (name: string, defaultValue: string) => {
  const initValue = localStorage.getItem(name);
  const [value, setValue] = useState(initValue || defaultValue);
  const nameRef = useRef(name);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setInitValue(name, setValue, defaultValue); }, []);

  useEffect(() => { handleValueChange(nameRef.current, value); }, [value]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { handleNameChange(nameRef, name, value); }, [name]);

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

export const configAuth = (authString: string, setAuthString: (arg0: string) => void) => {
  let auth = defaultAuth, setAuth = defaultSetAuth;
  try {
    auth = JSON.parse(authString);
    const setter: (arg0: string) => void = setAuthString as (arg0: string) => void;
    setAuth = (arg0: Iauth) => { setter(JSON.stringify(arg0)); };
  } catch (err) { console.log((err as Error).message); }
  return { auth, setAuth };
};

const checkUserAuth = async (
  token: string,
  userId: string | undefined,
  setAuthString:(arg0:string)=>void,
) => {
  try {
    const { body } = await superagent.get(`${process.env.BackendUrl}/user/${userId}`)
      .set('Accept', 'application/json').set('Authorization', `Bearer ${token}`);
    console.log(body);
  } catch (err) {
    setAuthString(JSON.stringify(defaultAuth));
  // if there is an error, reset auth to initial state
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
          await checkUserAuth(token, sub, setAuthString as React.Dispatch<React.SetStateAction<string>>);
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

