import React, { useEffect } from 'react';
import UserMap from './UserMap';
import CompanyMap from './CompanyMap';

const GoogleMap = (): JSX.Element => {
  useEffect(() => {
    const gMap = new google.maps.Map(document.getElementById('googleMap'), { zoom: 2, center: { lat: 0, lng: 0 } });
    console.log(gMap);
  });
  const userMap = new UserMap();
  console.log(userMap);
  const companyMap = new CompanyMap();
  console.log(companyMap);
  return (
    <div className="page-content">
      <div style={{ margin: 'auto', textAlign: 'center' }}>
        <h2 style={{ marginTop: '10px' }}>Google Map Here</h2>
        <div id="googleMap" />
      </div>
    </div>
  );
};
export default GoogleMap;
