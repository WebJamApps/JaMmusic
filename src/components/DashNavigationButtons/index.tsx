import React from 'react';
import type { MusicDashboard } from '../../containers/MusicDashboard';

type PageProps = { comp:MusicDashboard };

const photoButton = ({ comp }:PageProps): JSX.Element => (
  <button className="waves-effect grey darken-4 btn" type="button" id="Photos-Button" onClick={comp.handleNavClick}>
    Photos
  </button>
);

const tourButton = ({ comp }:PageProps): JSX.Element => (
  <button className="waves-effect grey darken-4 btn" type="button" id="Tours-Button" onClick={comp.handleNavClick}>
    Tours
  </button>
);

const songButton = ({ comp }:PageProps): JSX.Element => (
  <button className="waves-effect grey darken-4 btn" type="button" id="Songs-Button" onClick={comp.handleNavClick}>
    Songs
  </button>
);

export const DashNavigationButtons = ({ comp }:PageProps): JSX.Element => (
  <h3 style={{
    position: 'fixed', textAlign: 'left', margin: '14px', fontWeight: 'bold',
  }}
  >
    Music Dashboard
    <div
      className="Nav-Buttons"
      style={{
        position: 'fixed', padding: '10px', marginTop: '10px', maxWidth: '50%',
      }}
    >
      {photoButton({ comp })}
      {tourButton({ comp })}
      {songButton({ comp })}
    </div>
  </h3>
);
export default DashNavigationButtons;
