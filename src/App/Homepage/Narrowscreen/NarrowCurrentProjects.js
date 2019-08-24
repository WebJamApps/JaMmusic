import React from 'react';

const NarrowCurrentProjects = () => (
  <div className="notWidescreen">
    <div className="material-content">
      <h3 style={{ textAlign: 'center', marginTop: '15px', marginBottom: '15px' }}>Our Current Projects</h3>
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
      <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
      <div className="elevation2" style={{ padding: '10px', maxWidth: '500px', margin: 'auto' }}>
        <h4 style={{ textAlign: 'center' }}><strong>Apperson Automotive</strong></h4>
        <div style={{ textAlign: 'center' }}>
          <img
            alt="Apperson Automotive Home Page"
            style={{ width: '260px' }}
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
      <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
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
      <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
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
    </div>
  </div>
);

export default NarrowCurrentProjects;
