import React from 'react';
import { Link } from 'react-router-dom';

const Intro = () => (
  <div className="intro">
    <p style={{ marginTop: '10px' }}>
      Josh and Maria have been performing their music together for over six years now!
      Whether it is at church, charity events, public venues, or outdoor festivals, this couple will blow your socks off.
      Click&nbsp;
      <Link to="/music/originals">here</Link>
      &nbsp;to listen.
    </p>
  </div>
);

export default Intro;
