
function JoshShermanApple():JSX.Element {
  return (
    <>
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
      </div>
    </>
  );
}

export default JoshShermanApple;
