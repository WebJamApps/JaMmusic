
import Instruments from './instruments';

const BioText = () => (
  <p className="bioText" style={{ paddingLeft: 10, paddingRight: 5 }}>
    Josh began playing the trumpet when he was in third grade. He became skilled with the trumpet,
    continuing with his musical stylings through high school where he was first chair and regular
    soloist on the marching field. In college Josh studied music and picked up the guitar. He was
    primarily self-taught on the guitar, although he received help from his many musical relatives,
    especially his Uncle Mike. Josh went on to found several bands while living in central Florida.
    He recorded two cds and was played on the local radio stations. Josh also played in many
    venues including the Sun Cruise casino ship and the Battle of the Bands. His career took a
    different turn when he moved to Virginia. Leaving his band behind, Josh performed at the annual Bent Mountain pig
    roast every year since. He joined the College Lutheran Church choir and was a member of the Salem Choral Society.
    He also performed solo acoustic at local coffee shops.
    Josh started singing with Maria in the fall of 2011. They fell in love and were married
    in July of 2012. Vive l’amore!
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
