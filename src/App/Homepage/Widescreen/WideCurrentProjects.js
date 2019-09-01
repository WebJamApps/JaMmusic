import React from 'react';
import CollegeLutheran from '../CollegeLutheran';
import AppersonAutomotive from '../AppersonAutomotive';
import OHAF from '../OHAF';
import TroPeaks from '../TroPeaks';

const WideCurrentProjects = () => (
  <div className="widescreenHomepage">
    <div className="material-content">
      <div className="container">
        <h3 style={{ textAlign: 'center', marginTop: '15px', marginBottom: '15px' }}>Our Current Projects</h3>
        <div className="row">
          <div className="col">
            <CollegeLutheran />
          </div>
          <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
          <div className="col">
            <AppersonAutomotive />
          </div>
        </div>
        <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
        <div className="row">
          <div className="col">
            <OHAF />
          </div>
          <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
          <div className="col">
            <TroPeaks />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default WideCurrentProjects;
