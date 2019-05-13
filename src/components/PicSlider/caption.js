import React from 'react';
import PropTypes from 'prop-types';

const Caption = (props) => {
  const { caption } = props;
  return (
    <div
      className="slider-caption"
      style={{
        textAlign: 'center',
        fontWeight: 600,
        padding: '15px 0',
        boxShadow: '0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.14)',
        backgroundColor: '#fff',
        marginBottom: '10px',
        marginTop: '-5px',
      }}
    >
      {' '}
      {caption}
      {' '}
    </div>
  );
};

Caption.defaultProps = {
  caption: '',
};

Caption.propTypes = {
  caption: PropTypes.string,
};

export default Caption;
