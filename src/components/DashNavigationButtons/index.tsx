import React from 'react';
import type { MusicDashboard } from '../../containers/MusicDashboard';

type PageProps = { comp:MusicDashboard };

const photoButton = ({ comp }:PageProps): JSX.Element => (
    <button className="floatRight" type="button" id="Photos-Button" onClick={comp.handleNavClick}>
      Photos
    </button>
);

const tourButton =({ comp }:PageProps): JSX.Element => (
    <button className="floatRight" type="button" id="Tours-Button" onClick={comp.handleNavClick}>
      Tours
    </button>
);

const songButton =({ comp }:PageProps): JSX.Element =>(
    <button className="floatRight" type="button" id="Songs-Button" onClick={comp.handleNavClick}>
      Songs
    </button>
);


export const DashNavigationButtons = ({ comp }:PageProps): JSX.Element =>(
    <div
    className="Nav-Buttons"
    style={{
      padding: '10px', display: 'inline', textAlign: 'right', marginTop: '10px', maxWidth: '50%',
    }}
  >
    {photoButton({comp})}
    {tourButton({comp})}
    {songButton({comp})}
  </div>
);
export default DashNavigationButtons;
