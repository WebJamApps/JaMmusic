import React from 'react';

const OHAF = () => (

  <div className="elevation2" style={{ padding: '10px', maxWidth: '500px', margin: 'auto' }}>
    <h4 style={{ textAlign: 'center' }}>
      <strong>
          Our Hands and Feet
          (
        <a href="/ohaf">OHAF</a>
          )
      </strong>
    </h4>
    <p style={{ textAlign: 'center' }}>This app connects volunteers with charity opportunities.</p>
    <div style={{ textAlign: 'center' }}>
      <img
        alt="OHAF Logo"
        style={{ width: '260px' }}
        src="https://web-jam.com/static/imgs/ohaf/charitylogo.png"
      />
      <br />
      <a
        href="http://www.ourhandsandfeet.org"
        target="_blank"
        rel="noreferrer noopener"
        style={{ textDecoration: 'underline', textAlign: 'center' }}
      >
          ourhandsandfeet.org
      </a>
    </div>
  </div>
);

export default OHAF;
