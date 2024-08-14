import './links.scss';

function JoshShermanApple():JSX.Element {
  return (
    <div className="col">
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ marginTop: '30px', marginBottom: '12px' }}>Also on Apple Music</h4>
        <div className="appleMusic elevation3 top-row-style" style={{ textAlign: 'center', marginBottom: '50px' }}>
          <a
            href="https://music.apple.com/nz/artist/josh-sherman-band/id80070957"
            className="fab fa-apple fa-2x"
            style={{ color: '#333333', margin: '20px', marginLeft: '5%' }}
          >
            {' '}
            Josh Sherman Band
          </a>
          <a
            href="https://music.apple.com/us/album/solo-acoustic/80925503"
            className="fab fa-apple fa-2x"
            style={{ color: '#333333', margin: '20px', marginLeft: '5%' }}
          >
            {' '}
            Josh Solo Acoustic
          </a>
        </div>
      </div>
    </div>
  );
}

export default JoshShermanApple;
