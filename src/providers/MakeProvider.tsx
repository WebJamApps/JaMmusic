import { useEffect } from 'react';

interface ImakeProviderProps { Context: any; fetchFunc: any; setFunc: any; }

export const MakeProvider = (props: ImakeProviderProps) => {
  const { Context, fetchFunc, setFunc } = props;
  const { Provider } = Context;

  useEffect(() => {
    fetchFunc(setFunc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);// empty array here to stop it from repeatedly fetching

  return Provider;
};

