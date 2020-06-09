import React from 'react';

const JoshShermanSpotify = () => (
  <div>
    <h5>Also On Spotify</h5>
    <div className="row">
      <div className="col">
        <iframe
          src="https://open.spotify.com/embed/artist/4XGcA7sSHYypVflLH48KCx"
          width="320"
          height="500"
          title="soloAcoustic"
        />
      </div>
      <p style={{ fontSize: '1pt' }}>{' '}</p>
      <div className="col">
        <iframe
          src="https://open.spotify.com/embed/artist/5IvBs06z4RksIE1WvqLULs"
          width="320"
          height="500"
          title="soloAcoustic"
        />
      </div>
    </div>
  </div>
);

export default JoshShermanSpotify;
