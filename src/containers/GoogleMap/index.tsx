import React from 'react';
import UserMap from './UserMap';
import CompanyMap from './CompanyMap';

class GoogleMap extends React.Component {
  componentDidMount() {
    const gMap = new google.maps.Map(document.getElementById('googleMap'), { zoom: 3, center: { lat: 40, lng: -100 } });
    console.log('did mount');
    console.log(gMap);
  }

  render() {
    const userMap = new UserMap();
    console.log(userMap);
    const companyMap = new CompanyMap();
    console.log(companyMap);
    return (
      <div className="page-content">
        <div style={{ margin: 'auto', textAlign: 'center' }}>
          <h2 style={{ marginTop: '10px' }}>Google Map Here</h2>
          <div id="googleMap" style={{ height: '4in' }} />
        </div>
      </div>
    );
  }
}
export default GoogleMap;
