import React from 'react';
import type { MusicDashboard } from '../../containers/MusicDashboard';

type PageProps = { comp:MusicDashboard };

const photoButton = ({ comp }:PageProps): JSX.Element => (
  <button className="floatRight" type="button" id="Photos-Button" style={{ margin: '5px', fontSize: '55%' }} onClick={comp.handleNavClick}>
    Photos
  </button>
);

const tourButton = ({ comp }:PageProps): JSX.Element => (
  <button className="floatRight" type="button" id="Tours-Button" style={{ margin: '5px', fontSize: '55%' }} onClick={comp.handleNavClick}>
    Tours
  </button>
);

const songButton = ({ comp }:PageProps): JSX.Element => (
  <button className="floatRight" type="button" id="Songs-Button" style={{ margin: '5px', fontSize: '55%' }} onClick={comp.handleNavClick}>
    Songs
  </button>
);

export const DashNavigationButtons = ({ comp }:PageProps): JSX.Element => (
  <nav className="white">
    <div
      className="center"
      style={{
        width: '100%', textAlign: 'center', position: 'fixed',
      }}
    >
      <h3 style={{
        margin: '14px', fontWeight: 'bold', color: 'black',
      }}
      >
        Music Dashboard
        <div
          className="Nav-Buttons"
          id="Nav-Buttons"
          style={{
            display: 'inline', paddingLeft: '50px', maxWidth: '50%',
          }}
        >
          {photoButton({ comp })}
          {tourButton({ comp })}
          {songButton({ comp })}
        </div>
      </h3>
    </div>
  </nav>
);
export default DashNavigationButtons;
