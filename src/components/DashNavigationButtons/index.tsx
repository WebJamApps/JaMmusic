
const DashButtons = ({ comp }:any): JSX.Element => (
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
      id="Gigs-Button"
      style={{ margin: '5px', fontSize: '55%' }}
      onClick={comp.handleNavClick}
    >
      Gigs
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

export const DashNavigationButtons = ({ comp }:any): JSX.Element => (
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
export default DashNavigationButtons;
