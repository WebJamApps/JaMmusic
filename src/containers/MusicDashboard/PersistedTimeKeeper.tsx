import React from 'react';
import TimeKeeper from 'react-timekeeper';

export interface IPkProps {
  time:string, setShowTime: (...args:any) => any, setFormTime: (...args:any) => any
}

export const PersistedTimeKeeper = (props:IPkProps) =>{
  return (
    <TimeKeeper
            time={props.time}
            switchToMinuteOnHourSelect
            closeOnMinuteSelect
            onDoneClick={() => { props.setShowTime(false); props.setFormTime(props.time); }}
            onChange={(data) => { props.setFormTime(data.formatted12); }}
          />
  );
};
