import React, { useContext, useState } from 'react';
import { GigsContext } from '../providers/Gigs.provider';

export const Gigs = (): JSX.Element => {
  const { gigs } = useContext(GigsContext);
  console.log(gigs);
  const [allGigs, setGigs] = useState(gigs);
  return (
    <div style={{ margin: 'auto' }}>
      <h3>Gigs</h3>
      {JSON.stringify(allGigs)}
    </div>
  );
};
