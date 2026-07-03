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
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}>
            <h2 style={{
              color: 'var(--header-fg)',
              margin: 0,
              fontFamily: "'PT Sans Caption', sans-serif",
              fontWeight: 'bold',
              fontSize: '20px',
            }} data-testid="header-page-title">
              Admin Venues
            </h2>
          </div>
          <div
            id="header-controls-portal"
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          />
        </>
      )}
    </div>
  );
}

