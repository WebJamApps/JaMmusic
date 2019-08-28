import React from 'react';

const CollegeLutheran = () => (
  <div className="elevation2" style={{ padding: '10px', maxWidth: '500px', margin: 'auto' }}>
    <h4 style={{ textAlign: 'center' }}><strong>College Lutheran Church</strong></h4>
    <div style={{ textAlign: 'center' }}>
      <img
        alt="College Lutheran Church Homepage"
        style={{ width: '260px' }}
        src="https://dl.dropboxusercontent.com/s/354maifx0dkzt9s/Screenshot%20from%202019-02-22%2016-01-50.png?dl=0"
      />
      <br />
      <a
        href="https://www.collegelutheran.org"
        target="_blank"
        rel="noreferrer noopener"
        style={{ textDecoration: 'underline', textAlign: 'center' }}
      >
        Collegeluthean.org
      </a>
    </div>
  </div>
);

export default CollegeLutheran;
