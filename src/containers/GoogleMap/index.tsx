import React from 'react';
import UMap, { UserMap } from './UserMap';
import CMap, { CompanyMap } from './CompanyMap';
import { Loc } from './gMapTypes';

class GoogleMap extends React.Component {
  gMap: any;

  companyMap: any;

  userMap: any;

  constructor(props: any) {
    super(props);
    this.gMap = null;
    this.userMap = null;
    this.companyMap = null;
  }

  componentDidMount() {
    this.gMap = new google.maps.Map(document.getElementById('googleMap'), { zoom: 1, center: { lat: 40, lng: -100 } });
    this.userMap = new UMap();
    this.companyMap = new CMap();
    this.addMarker(this.userMap);
    this.addMarker(this.companyMap);
    console.log('did mount');
  }

  addMarker(obj: { loc: Loc }): void {
    const marker = new google.maps.Marker({
      map: this.gMap,
      position: {
        lat: obj.loc.lat, lng: obj.loc.lng,
      },
    });
    console.log(marker);
  }

  // addCompanyMarker(c: CompanyMap): void {
  //   const marker = new google.maps.Marker({
  //     map: this.gMap,
  //     position: {
  //       lat: c.loc.lat, lng: c.loc.lng,
  //     },
  //   });
  //   console.log(marker);
  // }

  render() {
    return (
      <div className="page-content">
        <div style={{ margin: 'auto', textAlign: 'center' }}>
          <h2 style={{ marginTop: '10px' }}>Google Map Here</h2>
          <div id="googleMap" style={{ height: '7in', maxWidth: '9in', margin: 'auto' }} />
        </div>
      </div>
    );
  }
}
export default GoogleMap;
