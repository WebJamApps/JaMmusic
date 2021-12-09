import React, { createContext, ReactChild, useEffect } from 'react';
import createPersistedState from 'use-persisted-state';
import fetchGigs, { defaultGig } from './fetchGigs';
const useGigsState = createPersistedState('gigs', sessionStorage);

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

export const GigsContext = createContext({
  gigs: [defaultGig],
  resetGigs:/*istanbul ignore next */(...args:any)=>{},
});
type Props = { children: ReactChild };

export const GigsProvider = ({ children }: Props): JSX.Element => {
  const { Provider } = GigsContext;
  const [gigs, setGigs] = useGigsState<IGig[]>([defaultGig]);
  const resetGigs = setGigs;
  useEffect(() => {
    fetchGigs.getGigs(setGigs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);// if we don't include this as empty array, it keeps repeatedly fetching the songs
  return (<Provider value={{ gigs, resetGigs }}>{children}</Provider>
  );
};

export default GigsProvider;
