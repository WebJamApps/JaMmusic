
import { useMediaQuery } from '@mui/material';
import Instruments from './instruments';

const BioText = () => (
  <div className="bioText" style={{ paddingLeft: 16, paddingRight: 16 }}>
    <p style={{ marginTop: '0px' }}>
      Maria sings and plays bass and also contributes to the songwriting process. She studied voice at Roanoke College
      and spent years playing piano, alto and tenor saxophone, drums, and bassoon, developing a diverse musical
      background that still influences her music today.
      After teaching math and science in Roanoke County Schools, she transitioned to remote work, but music has always
      remained close to her heart. Maria&rsquo;s favorite place to perform is onstage with Josh, singing and playing
      rock, Americana, and Christian music for live audiences.
      Known for her warm stage presence and strong vocals, Maria loves connecting with audiences and helping create
      performances that feel relaxed, personal, and fun.
    </p>
  </div>
);

function MariaBio() {
  const isMobile = useMediaQuery('(max-width:600px)');
  return (
    <div className="mariaBio">
      <h4 id="mariabio" style={{ marginBottom: '4px', marginTop: '8px', textAlign: 'center' }}>Meet Maria</h4>
      <div>
        <img
          style={{ paddingLeft: 10, paddingRight: 10, float: 'left' }}
          className="alignnone size-medium wp-image-50"
          src="/imgs/maria01.jpg"
          alt="maria01"
          width={isMobile ? '230px' : '288px'}
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
