import { useEffect } from 'react';

interface ImakeProviderProps { Context: any; fetches: any[]; setters: any[]; }

export const MakeProvider = (props: ImakeProviderProps) => {
  const { Context, fetches, setters } = props;
  const { Provider } = Context;

  useEffect(() => {
    fetches[0](setters[0]);
    fetches[1](setters[1]);
    fetches[2](setters[2]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);// empty array here to stop it from repeatedly fetching

  return Provider;
};

