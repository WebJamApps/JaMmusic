import React from 'react';
import { Link } from 'react-router-dom';

const Intro = () => (
  <div
    className="intro"
    style={{
      margin: 'auto', maxWidth: '1000px', padding: '6px', paddingBottom: 0,
    }}
  >
    <p style={{ marginTop: '10px', marginBottom: '6px' }}>
      Josh and Maria have been performing their music together for over eight years now!
      Whether it is at church, charity events, public venues, or outdoor festivals, this couple will blow your socks off.
      Click&nbsp;
      <Link to="/music/originals">here</Link>
      &nbsp;to listen.
    </p>
  </div>
);

export default Intro;
