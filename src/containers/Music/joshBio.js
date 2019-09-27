import React from 'react';
import Instruments from './instruments';

const JoshBio = () => (
  <div className="joshBio">
    <div style={{ height: '10px' }}><p>{' '}</p></div>
    <h4 id="joshbio" style={{ marginBottom: '4px', marginTop: '8px' }}>Josh Sherman</h4>
    <div>
      <img className="alignnone size-full wp-image-49" src="/static/imgs/josh01.jpg" alt="josh01" width="288px" />
    </div>
    <p className="bioText">
    Josh began playing the trumpet when he was in third grade. He became skilled with the trumpet,
    continuing with his musical stylings through high school where he was first chair and regular
    soloist on the marching field. In college Josh studied music and picked up the guitar. He was
    primarily self-taught on the guitar, although he received help from his many musical relatives,
    especially his Uncle Mike. Josh went on to found several bands while living in central Florida.
    He recorded two cds and was played on the local radio stations. Josh also played in many
    venues including the Sun cruise casino ship and the Battle of the Bands. His career took a
    different turn when he moved to Virginia. Leaving his band behind, Josh played at the GE Pig
    roast several years and performed solo at Mill Mountain coffee shop and the 4th Street coffee
    shop. Josh started singing with Maria in the fall of 2011. They fell in love and were married
    in July of 2012. Vive l’amore!
    </p>
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

export default JoshBio;
