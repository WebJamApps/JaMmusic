
import { useMediaQuery } from '@mui/material';
import Instruments from './instruments';

const BioText = () => (
  <div className="bioText" style={{ paddingLeft: 16, paddingRight: 16 }}>
    <p style={{ marginTop: '0px', paddingTop: '0px' }}>
      On stage, Josh plays guitar and harmonica, and sings vocals. Off stage, he writes most of our original music and
      handles the behind-the-scenes tech side of the duo. His musical journey started with trumpet in third grade, but
      when he picked up guitar in college, he never looked back.
      Before moving to Virginia, Josh led several bands in central Florida, recording two CDs and performing everywhere
      from cozy coffee shops to the SunCruz casino ship. Since settling in Virginia, he&rsquo;s become a familiar face
      around Salem and continues to share his love of music throughout the area.
    </p>
  </div>
);

function JoshBio() {
  const isMobile = useMediaQuery('(max-width:600px)');
  return (
    <div className="joshBio">
      <div style={{ height: '10px' }}><p>{' '}</p></div>
      <h4 id="joshbio" style={{ marginBottom: '4px', marginTop: '8px', textAlign: 'center' }}>Meet Josh</h4>
      <div>
        <img
          style={{ paddingLeft: 10, paddingRight: 10, float: 'left' }}
          className="alignnone size-full wp-image-49"
          src="/imgs/josh01.jpg"
          alt="josh01"
          width={isMobile ? '230px' : '288px'}
        />
      </div>
      <BioText />
      <blockquote style={{
        fontStyle: 'italic', textAlign: 'left', marginTop: '5px', fontSize: '9pt',
      }}
      >
        <p>
          And whenever the harmful spirit from God was upon Saul, David took the lyre
          and played it with his hand. So Saul was refreshed and was well, and the harmful spirit
          departed from him.
          {' '}
          <strong>1 Samuel 16:23</strong>
        </p>
      </blockquote>
      <aside className="instrumentList">
        <p>Instruments that Josh plays:</p>
        <Instruments type="Josh" />
      </aside>
    </div>
  );
}

export default JoshBio;
