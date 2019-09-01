import React from 'react';

const AppersonAutomotive = () => (
  <div className="elevation2" style={{ padding: '10px', maxWidth: '500px', margin: 'auto' }}>
    <h4 style={{ textAlign: 'center' }}><strong>Apperson Automotive</strong></h4>
    <div style={{ textAlign: 'center' }}>
      <img
        alt="Apperson Automotive Home Page"
        style={{ width: '260px', height: '328px' }}
        src="../static/imgs/AppersonAutomotive.png"
      />
      <br />
      <a
        href="https://www.appersonautomotive.com"
        target="_blank"
        rel="noreferrer noopener"
        style={{ textDecoration: 'underline', textAlign: 'center' }}
      >
        appersonautomotive.com
      </a>
    </div>
  </div>
);

export default AppersonAutomotive;
