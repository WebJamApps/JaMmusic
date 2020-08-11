import React from 'react';
import { Link } from 'react-router-dom';

const Intro = (): JSX.Element => (
  <div
    className="intro"
    style={{
      margin: 'auto', maxWidth: '900px', padding: '6px', paddingBottom: 0,
    }}
  >
    <h4 style={{
      textAlign: 'center', border: 'solid', margin: 'auto', width: '124px', borderWidth: 'thin', backgroundColor: '#d8ecf3',
    }}
    >
      <strong><Link to="/music/songs">Click To Listen</Link></strong>
    </h4>
    <p style={{ marginTop: '10px', marginBottom: '6px' }}>
      Josh and Maria have been performing their music together for over eight years now!
      Whether it is at church, charity events, public venues, or outdoor festivals, this couple will blow your socks off.
    </p>
  </div>
);

export default Intro;
