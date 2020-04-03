import React, { useState } from 'react';
import TimeKeeper from 'react-timekeeper';

type setFormTime = (...args: any) => any;

// @ts-ignore
// eslint-disable-next-line react/prop-types
export default function AddTime({ setFormTime }) {
  const [time, setTime] = useState('12:34pm');
  const [showTime, setShowTime] = useState(true);
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
        onChange={(data) => { setFormTime(data.formatted12); setTime(data.formatted12); }}
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
