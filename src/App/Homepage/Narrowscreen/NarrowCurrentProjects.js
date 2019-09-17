import React from 'react';
import CollegeLutheran from '../CollegeLutheran';
import AppersonAutomotive from '../AppersonAutomotive';
// import OHAF from '../OHAF';
import TroPeaks from '../TroPeaks';

const NarrowCurrentProjects = () => (
  <div className="notWidescreen">
    <div className="material-content">
      <h3 style={{ textAlign: 'center', marginTop: '15px', marginBottom: '15px' }}>Our Current Projects</h3>
      <CollegeLutheran />
      <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
      <AppersonAutomotive />
      {/* <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
      <OHAF /> */}
      <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
      <TroPeaks />
    </div>
  </div>
);

export default NarrowCurrentProjects;
