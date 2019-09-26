import React from 'react';
import Instruments from './instruments';

const MariaBio = () => (
  <div className="mariaBio">
    <h4 id="mariabio" style={{ marginBottom: '4px' }}>Maria Sherman</h4>
    <div><img className="alignnone size-medium wp-image-50" src="/static/imgs/maria01.jpg" alt="maria01" width="288px" /></div>
    <p className="bioText">
      Maria started her singing career at the age of 4 when she performed at the JaMar Rec
      Center in St. Petersburg, Florida. Maria continued adding to her musical repertoire
      by learning piano, alto saxophone, tenor saxophone, bassoon, and marching tenors.
      She earned a minor in voice at Roanoke College and did a variety of chorus, musical theatre,
      and solo performances while teaching in the Roanoke County Schools. Although classically
      trained, Maria loves singing rock and Christian music with Josh, and hopes to add bass
      guitar to her list of instruments soon. Josh is the most wonderful husband and is the driving
      force for the couple; Maria is a fabulous wife and is the organization behind the duo.
    </p>
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

export default MariaBio;
