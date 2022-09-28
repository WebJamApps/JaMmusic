/* eslint-disable @typescript-eslint/no-explicit-any */
export function DateTimePicker(props:any) {
  return <input {...props}>{props.children}</input>;
}

export function LocalizationProvider(props:any) {
  return <div {...props}>{props.children}</div>;
}
