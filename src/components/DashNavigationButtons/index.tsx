
import type { MusicDashboard } from '../../containers/MusicDashboard';

type PageProps = { comp:MusicDashboard };

function DashButtons({ comp }:PageProps): JSX.Element {
  return (
    <div
      className="Nav-Buttons"
      id="Nav-Buttons"
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
}

export function DashNavigationButtons({ comp }:PageProps): JSX.Element {
  return (
    <div
      className="center"
    >
      <h4
        className="Musicdash-Title"
      >
        Music Dashboard
        {DashButtons({ comp })}
      </h4>
    </div>
  );
}
export default DashNavigationButtons;
