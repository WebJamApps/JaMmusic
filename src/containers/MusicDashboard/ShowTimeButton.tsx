
export function ShowTimeButton(props:{ setShowTime:(...args:any)=>any, time:string }):JSX.Element {
  return (
    <div className="time-div">
      Time selected:
      {' '}
      {props.time}
      <br />
      <button className="show-clock" type="button" onClick={() => props.setShowTime(true)}>Show Clock</button>
    </div>
  );
}
