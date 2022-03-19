
import createPersistedState from 'use-persisted-state';
import { PersistedTimeKeeper } from './PersistedTimeKeeper';
import { ShowTimeButton } from './ShowTimeButton';
const useTimeState = createPersistedState('showTime', sessionStorage);
type Props = {
  setFormTime: (args0: string) => void, initTime: string, show:boolean
};
export default function AddTime({ setFormTime, initTime, show }: Props): JSX.Element { // eslint-disable-line react/prop-types
  const time = initTime !== '' ? initTime : '12:34pm';
  const [showTime, setShowTime] = useTimeState(show);
  return (
    <div className="clock-input">
      <br />
      <span>* Time</span>
      <br />
      {showTime
        ? (
          <PersistedTimeKeeper time={time} setShowTime={setShowTime} setFormTime={setFormTime}/>
        ) : null}
      {!showTime
        ? (
          <ShowTimeButton setShowTime={setShowTime} time={time}/>
        ) : null}
    </div>
  );
}
