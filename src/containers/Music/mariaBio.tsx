
import Instruments from './instruments';

const BioText = () => (
  <p className="bioText" style={{ paddingLeft: 10, paddingRight: 10 }}>
    Maria sings lead, plays bass and accordion, and is the duo&rsquo;s organizer-in-chief. Classically trained &mdash;
    voice minor at Roanoke College, with piano, alto and tenor sax, and bassoon from her school years. She taught in
    Roanoke County Schools and now works remotely. Although her training is classical, her favorite stage is next to
    Josh playing rock, Americana, and Christian music.
  </p>
);

function MariaBio(): JSX.Element {
  return (
    <div className="mariaBio">
      <h4 id="mariabio" style={{ marginBottom: '4px', marginTop: '8px', textAlign: 'center' }}>Maria Sherman</h4>
      <div>
        <img
          style={{ paddingLeft: 10, paddingRight: 10, float: 'left' }}
          className="alignnone size-medium wp-image-50"
          src="/static/imgs/maria01.jpg"
          alt="maria01"
          width="288px"
        />
      </div>
      <BioText />
      <blockquote style={{
        fontStyle: 'italic', textAlign: 'left', marginTop: '5px', fontSize: '9pt',
      }}
      >
        <p>
          Whoever sings songs to a heavy heart is like one who takes off a garment on a cold
          day, and like vinegar on soda.
          {' '}
          <strong>Proverbs 25:20</strong>
        </p>
      </blockquote>
      <aside className="instrumentList">
        <p>Instruments that Maria plays:</p>
        <Instruments type="Maria" />
      </aside>
    </div>
  );
}

export default MariaBio;
