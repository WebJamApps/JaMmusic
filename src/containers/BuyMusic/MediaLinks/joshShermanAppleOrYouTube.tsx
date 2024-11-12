import './links.scss';

export function JoshShermanAppleOrYouTube({ service }: { service: 'Apple Music' | 'YouTube' }): JSX.Element {
  return (
    <div className="col">
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ marginTop: '30px', marginBottom: '2px' }}>
          Also on
          {' '}
          {service}
        </h4>
        <div className="elevation3 top-row-style" style={{ textAlign: 'center', marginBottom: '50px' }}>
          <a
            href={service === 'Apple Music' ? 'https://music.apple.com/nz/artist/josh-sherman-band/id80070957'
              : '"https://youtube.com/playlist?list=OLAK5uy_mtLf1U_oKuSgkFRcXYpo5E0OJWnvRt1TI"'}
            className={service === 'Apple Music' ? 'fab fa-apple fa-2x' : 'fab fa-youtube fa-2x'}
            style={{ color: '#333333', margin: '20px', marginLeft: '5%' }}
          >
            {' '}
            Josh Sherman Band
          </a>
          <a
            href={service === 'Apple Music' ? 'https://music.apple.com/us/album/solo-acoustic/80925503'
              : 'https://youtube.com/playlist?list=OLAK5uy_nmxiOsu9BvdnwfHZ2w4ix3AG0POpsJPKA'}
            className={service === 'Apple Music' ? 'fab fa-apple fa-2x' : 'fab fa-youtube fa-2x'}
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

