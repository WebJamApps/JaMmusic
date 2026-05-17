
import Instruments from './instruments';

const BioText = () => (
  <p className="bioText" style={{ paddingLeft: 10, paddingRight: 5 }}>
    Josh plays guitar and trumpet, writes most of the originals, and runs the duo&rsquo;s tech side. He started on
    trumpet in third grade, picked up guitar in college, and led several bands in central Florida &mdash; recording two
    CDs and playing venues from local coffee shops to the Sun Cruise casino ship &mdash; before moving to Virginia.
    Since the move he&rsquo;s been a fixture at the Bent Mountain Pig Roast and a member of the College Lutheran choir
    and Salem Choral Society.
  </p>
);

function JoshBio(): JSX.Element {
  return (
    <div className="joshBio">
      <div style={{ height: '10px' }}><p>{' '}</p></div>
      <h4 id="joshbio" style={{ marginBottom: '4px', marginTop: '8px', textAlign: 'center' }}>Josh Sherman</h4>
      <div>
        <img
          style={{ paddingLeft: 10, paddingRight: 10, float: 'left' }}
          className="alignnone size-full wp-image-49"
          src="/static/imgs/josh01.jpg"
          alt="josh01"
          width="288px"
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
