import React, { useState } from 'react';
import TimeKeeper from 'react-timekeeper';

export default function AddTime({ setFormTime, initTime }) { // eslint-disable-line react/prop-types
  const time = initTime !== '' ? initTime : '12:34pm';
  const [showTime, setShowTime] = useState(true);
  return (
    <div className="clock-input">
      <br />
      <span>* Time</span>
      <br />
      {showTime
        ? (
          <TimeKeeper
            time={time}
            switchToMinuteOnHourSelect
            closeOnMinuteSelect
            onDoneClick={() => { setShowTime(false); setFormTime(time); }}
            onChange={(data) => { setFormTime(data.formatted12); }}
          />
        ) : null}
      {!showTime
        ? (
          <div className="time-div">
            Time selected:
            {' '}
            {time}
            <br />
            <button className="show-clock" type="button" onClick={() => setShowTime(true)}>Show Clock</button>
          </div>
        ) : null}
    </div>
  );
}
