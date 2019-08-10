import React from 'react';

const activeUsers = (heartBeat, userCount) => (
  <div>
    <button
      type="button"
      style={{
        cursor: 'none', marginLeft: '10px', height: '18px', width: '18px', backgroundColor: heartBeat,
      }}
    >
      {' '}
    </button>
    <span style={{ paddingLeft: '10px', marginTop: '10px' }}>
      <i>Active Users</i>
:
      {' '}
      {userCount}
    </span>
  </div>
);

export default { activeUsers };
