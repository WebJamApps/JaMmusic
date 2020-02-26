import React from 'react';

const activeUsers = (heartBeat, userCount) => (
  <div className="active-users">
    <div>
      <button
        type="button"
        style={{
          cursor: 'none', marginLeft: '10px', height: '20px', width: '20px', marginTop: '10px', backgroundColor: heartBeat,
        }}
      >
        {' '}
      </button>
    </div>
    <div className="active-users-text" style={{ paddingLeft: '10px', marginTop: '5px' }}>
      <i>Active Users</i>
      :
      {' '}
      {userCount}
    </div>
  </div>
);

export default { activeUsers };
