import React, { useState } from 'react';
import TimeKeeper from 'react-timekeeper';

function AddTime() {
  const [time, setTime] = useState('12:34pm');
  const [showTime, setShowTime] = useState(true);

  return (
    <div>
      {showTime
      && (
      <TimeKeeper
        time={time}
        switchToMinuteOnHourSelect
        closeOnMinuteSelect
        onDoneClick={() => setShowTime(false)}
        onChange={(data) => setTime(data.formatted12)}
      />
      )}
      <br />
      <span>
        Time selected:
        {' '}
        {time}
      </span>
      <br />
      {!showTime
        && <button type="button" onClick={() => setShowTime(true)}>Show Clock</button>}
    </div>
  );
}

export default AddTime;
