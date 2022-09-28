import { Footer } from './Footer';

function HeaderSection() {
  return (
    <div id="header" className="material-header home-header">
      <div id="ohaflogo" className="headercontent">
        <img alt="ohaflogo" src="../static/imgs/webjamicon7.png" className="home-header-image" />
      </div>
      <div className="headercontent header-text-card">
        <h3 className="header-text" style={{ marginTop: 0 }}>Web Jam LLC</h3>
      </div>
    </div>
  );
}

export function MainPanel({ children, onClick, onKeyPress }:any) {
  return (
    <div className="main-panel">
      <span
        onClick={onClick}
        onKeyPress={onKeyPress}
        id="mobilemenutoggle"
        tabIndex={0}
        role="button"
      >
        <i className="fas fa-bars" />
      </span>
      <div className="mainPanel">
        <div className="swipe-area" />
        <HeaderSection />
        <div style={{ width: 'auto' }} id="contentBlock" className="content-block">
          {children}
          <Footer />
        </div>
      </div>
    </div>
  );
}
