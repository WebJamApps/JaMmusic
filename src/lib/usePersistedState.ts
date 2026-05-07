import {
  MutableRefObject, useEffect, useRef, useState,
} from 'react';

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

export const usePersistedState = (name: string, defaultValue: string) => {
  const initValue = localStorage.getItem(name);
  const [value, setValue] = useState(initValue || defaultValue);
  const nameRef = useRef(name);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setInitValue(name, setValue, defaultValue); }, []);

  useEffect(() => { handleValueChange(nameRef.current, value); }, [value]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { handleNameChange(nameRef, name, value); }, [name]);

  return [value, setValue] as const;
};
