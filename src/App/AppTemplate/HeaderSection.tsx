import { useLocation } from 'react-router-dom';

export function HeaderSection() {
  const location = useLocation();
  const isAdminVenues = location.pathname === '/admin/venues';

  return (
    <div id="header" className="material-header home-header" style={{ position: 'relative' }}>
      <div id="ohaflogo" className="headercontent">
        <img alt="ohaflogo" src="/imgs/webjamicon7.png" className="home-header-image" />
      </div>
      <div className="headercontent header-text-card">
        <h3 className="header-text" style={{ marginTop: 0 }}>Web Jam LLC</h3>
      </div>
      {isAdminVenues && (
        <>
          <div className="header-page-title-container">
            <h2 className="header-page-title" data-testid="header-page-title">
              Admin Venues
            </h2>
          </div>
          <div
            id="header-controls-portal"
            className="header-controls-portal"
          />
        </>
      )}
    </div>
  );
}

