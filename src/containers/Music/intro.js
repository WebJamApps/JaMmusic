import React from 'react';
import PropTypes from 'prop-types';

const Intro = (props) => {
  const { originals } = props;
  return (
    <div className="intro">
      <p style={{ marginTop: '10px' }}>
Josh and Maria have been performing their music together for over six years now!
    Whether it is at church, charity events, public venues, or outdoor festivals, this couple will blow your socks off.
    Click
        {' '}
        <a rel="noopener noreferrer" href={originals}>here</a>
        {' '}
to listen.
      </p>
    </div>
  );
};
Intro.defaultProps = {
  originals: ''
};

Intro.propTypes = {
  originals: PropTypes.string
};
export default Intro;
