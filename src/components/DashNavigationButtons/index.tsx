import React from 'react';
import type { MusicDashboard } from '../../containers/MusicDashboard';

type PageProps = { comp:MusicDashboard };

const DashButtons = ({ comp }:PageProps): JSX.Element => (
  <div
    className="Nav-Buttons"
    id="Nav-Buttons"
    style={{
      display: 'inline', paddingLeft: '50px', maxWidth: '50%',
    }}
  >
    <button className="floatRight1" type="button" id="Photos-Button" style={{ margin: '5px', fontSize: '55%' }} onClick={comp.handleNavClick}>
      Photos
    </button>
    <button className="floatRight2" type="button" id="Tours-Button" style={{ margin: '5px', fontSize: '55%' }} onClick={comp.handleNavClick}>
      Tours
    </button>
    <button className="floatRight3" type="button" id="Songs-Button" style={{ margin: '5px', fontSize: '55%' }} onClick={comp.handleNavClick}>
      Songs
    </button>
  </div>
);

export const DashNavigationButtons = ({ comp }:PageProps): JSX.Element => (
  <nav className="white">
    <div
      className="center"
      style={{
        width: '100%', textAlign: 'center',
      }}
    >
      <h3 style={{
        margin: '14px', fontWeight: 'bold', color: 'black', fontSize: '25px',
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
          {DashButtons({ comp })}
        </div>
      </h3>
    </div>
  </nav>
);
export default DashNavigationButtons;
