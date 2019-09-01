import React from 'react';

const TroPeaks = () => (
  <div className="elevation2" style={{ padding: '10px', maxWidth: '500px', margin: 'auto' }}>
    <h4 style={{ textAlign: 'center' }}>
      <strong>
          Tro Peaks Adventures
      </strong>
    </h4>
    <p style={{ textAlign: 'center' }}>East African Tour &amp; Safari Company</p>
    <div style={{ textAlign: 'center' }}>
      <img
        alt="Tro Peaks Logo"
        style={{ width: '260px' }}
        src="../static/imgs/TroPeaks.png"
      />
      <br />
      <a
        href="https://www.tro-peaks.com"
        target="_blank"
        rel="noreferrer noopener"
        style={{ textDecoration: 'underline', textAlign: 'center' }}
      >
          tro-peaks.com
      </a>
    </div>
  </div>
);

export default TroPeaks;
