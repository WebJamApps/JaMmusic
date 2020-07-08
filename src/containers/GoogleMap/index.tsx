import React from 'react';
import UMap from './UserMap';
import CMap from './CompanyMap';
import { Loc } from './gMapTypes';
import gMapUtils, { IgMapUtils } from './gMapUtils';

class GoogleMap extends React.Component {
  gMap: any;

  companyMap: any;

  userMap: any;

  content: string;

  gMapUtils: IgMapUtils;

  constructor(props: any) {
    super(props);
    this.gMap = null;
    this.userMap = null;
    this.companyMap = null;
    this.content = '';
    this.gMapUtils = gMapUtils;
  }

  componentDidMount(): void {
    const mapDiv = document.getElementById('googleMap');
    if (mapDiv) this.gMap = new google.maps.Map(mapDiv, { zoom: 2, center: { lat: 40, lng: -100 } });
    this.userMap = new UMap();
    this.userMap = this.gMapUtils.limitLat(this.userMap);
    // if (this.userMap.loc.lat > 83) this.userMap.loc.lat = 83;
    // if (this.userMap.loc.lat < -70) this.userMap.loc.lat = -70;
    this.content = `<div><p><strong>User Name:</strong> ${this.userMap.name}</p>`
      + `<p><strong>Latitude:</strong> ${this.userMap.loc.lat}</p></div>`;
    this.addMarker(this.userMap);
    this.companyMap = new CMap();
    this.companyMap = this.gMapUtils.limitLat(this.companyMap);
    // if (this.companyMap.loc.lat > 83) this.companyMap.loc.lat = 83;
    // if (this.companyMap.loc.lat < -70) this.companyMap.loc.lat = -70;
    this.content = `<div><p><strong>Company Name:</strong> ${this.companyMap.name}</p>`
      + `<p><strong>Company Slogan:</strong> ${this.companyMap.catchPhrase}</p>`
      + `<p><strong>Latitude:</strong> ${this.companyMap.loc.lat}</p></div>`;
    this.addMarker(this.companyMap, {
      scaledSize: { width: 40, height: 40 },
      url: 'https://cdn0.iconfinder.com/data/icons/financial-business/512/company_building-512.png',
    });
  }

  addMarker(obj: { loc: Loc }, icon?: any): void {
    const infoWindow = new google.maps.InfoWindow({ content: this.content });
    const marker = new google.maps.Marker({
      map: this.gMap,
      position: {
        lat: obj.loc.lat, lng: obj.loc.lng,
      },
      icon,
    });
    marker.addListener('click', () => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      infoWindow.open(this.gMap, marker);
    });
  }

  render(): JSX.Element {
    return (
      <div className="page-content">
        <div style={{ margin: 'auto', textAlign: 'center' }}>
          <h3 style={{ marginTop: '10px' }}>Google Map Here</h3>
          <div id="googleMap" style={{ height: '10in', maxWidth: '10in', margin: 'auto' }} />
        </div>
      </div>
    );
  }
}
export default GoogleMap;
