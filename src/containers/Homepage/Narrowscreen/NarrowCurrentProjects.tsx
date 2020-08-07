import React from 'react';
import CollegeLutheran from '../CollegeLutheran';
import AppersonAutomotive from '../AppersonAutomotive';

const NarrowCurrentProjects = (): JSX.Element => (
  <div className="notWidescreen">
    <div className="material-content">
      <h3 style={{ textAlign: 'center', marginTop: '15px', marginBottom: '15px' }}>Our Current Projects</h3>
      <CollegeLutheran />
      <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
      <AppersonAutomotive />
    </div>
  </div>
);

export default NarrowCurrentProjects;
