import React, { Component } from 'react';
import WideAboutUs from './Homepage/Widescreen/WideAbout';
import WideCurrentProjects from './Homepage/Widescreen/WideCurrentProjects';
import WideTicker from './Homepage/Widescreen/WideFacebookTicker';
// import NarrowAboutUs from './Homepage/Narrowscreen/NarrowAbout';
// import NarrowCurrentProjects from './Homepage/Narrowscreen/NarrowCurrentProjects';
// import NarrowTicker from './Homepage/Narrowscreen/NarrowFacebookTicker';

// eslint-disable-next-line react/prefer-stateless-function
export default class Home extends Component {
  render() {
    return (
      // Add link-to-top for accessibility
      <div>
        <div className="page-content">
          <WideAboutUs />
          <hr />
          <WideCurrentProjects />
        </div>

        <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
        <WideTicker />
      </div>
    );
  }
}
