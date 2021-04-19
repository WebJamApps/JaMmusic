import React from 'react';
import type { MusicDashboard } from '../../containers/MusicDashboard';

type PageProps = { comp:MusicDashboard };

const DashButtons = ({ comp }:PageProps): JSX.Element => (
  <div
    className="Nav-Buttons"
    id="Nav-Buttons"
    style={{
      display: 'inline',
    }}
  >
    <button
      className="floatRight1"
      type="button"
      id="Photos-Button"
      style={{ margin: '5px', fontSize: '55%' }}
      onClick={comp.handleNavClick}
    >
      Photos
    </button>
    <button
      className="floatRight2"
      type="button"
      id="Tours-Button"
      style={{ margin: '5px', fontSize: '55%' }}
      onClick={comp.handleNavClick}
    >
      Tours
    </button>
    <button
      className="floatRight3"
      type="button"
      id="Songs-Button"
      style={{ margin: '5px', fontSize: '55%' }}
      onClick={comp.handleNavClick}
    >
      Songs
    </button>
  </div>
);

export const DashNavigationButtons = ({ comp }:PageProps): JSX.Element => (
  <nav className="white">
    <div
      className="center"
      style={{
        textAlign: 'center',
      }}
    >
      <h4
        className="Musicdash-Title"
        style={{
          margin: '14px', fontWeight: 'bold', color: 'black',
        }}
      >
        Music Dashboard
        {DashButtons({ comp })}
      </h4>
    </div>
  </nav>
);
export default DashNavigationButtons;
