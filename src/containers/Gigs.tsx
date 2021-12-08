import React, { useContext } from 'react';
import { GigsContext } from '../providers/Gigs.provider';

export const Gigs = (): JSX.Element => {
  const { gigs } = useContext(GigsContext);
  return (
    <div style={{ margin: 'auto', padding:'10px' }}>
      <h4 style={{ textAlign:'center' }}>Gigs</h4>
      {JSON.stringify(gigs)}
    </div>
  );
};
