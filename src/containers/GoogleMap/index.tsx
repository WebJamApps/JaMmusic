import React from 'react';
import UserMap from './UserMap';
import CompanyMap from './CompanyMap';

const GoogleMap = (): JSX.Element => {
  const userMap = new UserMap();
  console.log(userMap);
  const companyMap = new CompanyMap();
  console.log(companyMap);
  return (
    <div className="page-content">
      <div style={{ margin: 'auto', textAlign: 'center' }}>
        <h2 style={{ marginTop: '10px' }}>Google Map Here</h2>
      </div>
    </div>
  );
};
export default GoogleMap;
