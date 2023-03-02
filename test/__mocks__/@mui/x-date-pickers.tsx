/* eslint-disable @typescript-eslint/no-explicit-any */
export function DateTimePicker(props:any) {
  const { children } = props;
  return <input {...props}>{children}</input>;
}

export function LocalizationProvider(props:any) {
  const { children } = props;
  return <div {...props}>{children}</div>;
}
