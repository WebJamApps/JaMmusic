import React, { createContext, useState, ReactChild } from 'react';

export const TourTableContext = createContext({
  test: '',
});
type Props = { children: ReactChild };
const TourTableProvider = ({ children }: Props): JSX.Element => {
  const { Provider } = TourTableContext;
  const [test] = useState('the tour table provider has been successfully connected :)');
  return (<Provider value={{ test }}>{children}</Provider>
  );
};

export default TourTableProvider;
