
function JoshShermanSpotify(): JSX.Element {
  return (
    <div className="spotify">
      <h4 style={{ marginBottom: '0px' }}>Also On Spotify</h4>
      <div className="row">
        <div className="col" style={{ paddingRight: '0px' }}>
          <iframe
            src="https://open.spotify.com/embed/artist/5IvBs06z4RksIE1WvqLULs"
            width="312"
            height="436"
            title="soloAcoustic"
          />
        </div>
        <p style={{ fontSize: '1pt' }}>{' '}</p>
        <div className="col" style={{ paddingRight: '0px' }}>
          <iframe
            src="https://open.spotify.com/embed/artist/4XGcA7sSHYypVflLH48KCx"
            width="312"
            height="436"
            title="soloAcoustic"
          />
        </div>
      </div>
    </div>
  );
}

export default JoshShermanSpotify;
