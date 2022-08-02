
import { Component } from 'react';
import UMap from './UserMap';
import CMap from './CompanyMap';
import gMapUtils from './gMapUtils';

export interface Iloc { lat: number, lng: number }

class GoogleMap extends Component {
  gMap: google.maps.Map | null;

  companyMap: CMap | null;

  userMap: UMap | null;

  content: string;

  gMapUtils: typeof gMapUtils;

  constructor(props: Record<string, unknown>) {
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
    this.userMap = this.gMapUtils.limitUserLat(this.userMap);
    this.content = `<div><p><strong>User Name:</strong> ${this.userMap.name}</p>`
      + `<p><strong>Latitude:</strong> ${this.userMap.loc.lat}</p></div>`;
    this.addMarker(this.userMap);
    this.companyMap = new CMap();
    this.companyMap = this.gMapUtils.limitCompanyLat(this.companyMap);
    this.content = `<div><p><strong>Company Name:</strong> ${this.companyMap.name}</p>`
      + `<p><strong>Company Slogan:</strong> ${this.companyMap.catchPhrase}</p>`
      + `<p><strong>Latitude:</strong> ${this.companyMap.loc.lat}</p></div>`;
    this.addMarker(this.companyMap, {
      scaledSize: { width: 40, height: 40, equals: /* istanbul ignore next */() => true },
      url: 'https://image.flaticon.com/icons/png/512/63/63838.png',
    });
  }

  addMarker(obj: { loc: Iloc }, icon?: google.maps.Icon | undefined): void {
    const infoWindow = new google.maps.InfoWindow({ content: this.content });
    if (this.gMap !== null) {
      const marker = new google.maps.Marker({
        map: this.gMap,
        position: {
          lat: obj.loc.lat, lng: obj.loc.lng,
        },
        icon,
      });
      marker.addListener('click', () => { // eslint-disable-next-line security/detect-non-literal-fs-filename
        /* istanbul ignore else */if (this.gMap !== null)infoWindow.open(this.gMap, marker);
      });
    }
  }

  render(): JSX.Element {
    return (
      <div className="page-content">
        <div style={{ margin: 'auto', textAlign: 'center' }}>
          <h3 style={{ marginTop: '10px' }}>Google Map Here</h3>
          <div id="googleMap" style={{ height: '8.5in', maxWidth: '11in', margin: 'auto' }} />
        </div>
      </div>
    );
  }
}
export default GoogleMap;
