import React, { useState } from 'react';
import TimeKeeper from 'react-timekeeper';

export default function AddTime() {
  const [time, setTime] = useState('12:34pm');
  const [showTime, setShowTime] = useState(true);
  console.log(time);
  return (
    <div>
      <br />
      <span>* Time</span>
      <br />
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
      {!showTime
        && (
        <div>
          Time selected:
          {' '}
          {time}
          <br />
          <button type="button" onClick={() => setShowTime(true)}>Show Clock</button>
        </div>
        )}
    </div>
  );
}
