
function JoshShermanSpotify(): JSX.Element {
  const colStyle = {
    flexBasis: '0',
    msFlexPreferredSize: '0',
    msFlexPositive: '1',
    flexGrow: '1',
    maxWidth: '100%',
  };
  return (
    <div className="col" style={colStyle}>
      <div style={{ margin: 'auto', textAlign: 'center', marginTop: '50px' }}>
        <div className="spotify">
          <h4 style={{ marginBottom: '0px' }}>Also On Spotify</h4>
          <div
            className="row"
            style={{
              marginLeft: '-15px', marginRight: '-15px', display: 'flex', flexWrap: 'wrap',
            }}
          >
            {/* <div className="col" style={{ paddingRight: '0px' }}> */}
            <div className="col" style={colStyle}>

              <iframe
                src="https://open.spotify.com/embed/artist/5IvBs06z4RksIE1WvqLULs"
                width="312"
                height="436"
                title="soloAcoustic"
              />
            </div>
            <p style={{ fontSize: '1pt' }}>{' '}</p>
            {/* <div className="col" style={{ paddingRight: '0px' }}> */}
            <div className="col" style={colStyle}>

              <iframe
                src="https://open.spotify.com/embed/artist/4XGcA7sSHYypVflLH48KCx"
                width="312"
                height="436"
                title="soloAcoustic"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoshShermanSpotify;
