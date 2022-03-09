import { createContext, ReactChild, useEffect } from 'react';
import createPersistedState from 'use-persisted-state';
import fetchGigs, { defaultGig } from './fetchGigs';

export interface IGig {
  modify?:JSX.Element,
  datetime?: string;
  more?: string;
  date: string;
  time: string;
  tickets: string;
  venue: string;
  location: string;
  _id?: string;
  id?:number;
}

const useGigsState:(arg0: IGig[]) =>
[IGig[], (arg0: IGig[]) => void] = 
createPersistedState('gigs', sessionStorage);

export const GigsContext = createContext({
  gigs: [defaultGig],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGigs:/*istanbul ignore next */(_arg0: IGig[])=>{},
});

type Props = { children: ReactChild };

export const GigsProvider = ({ children }: Props): JSX.Element => {
  const { Provider } = GigsContext;
  const [gigs, setGigs] = useGigsState([defaultGig]);

  useEffect(() => {
    fetchGigs.getGigs(setGigs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);// if we don't include this as empty array, it keeps repeatedly fetching the songs
  
  return (<Provider value={{ gigs, setGigs }}>{children}</Provider>
  );
};

export default GigsProvider;
