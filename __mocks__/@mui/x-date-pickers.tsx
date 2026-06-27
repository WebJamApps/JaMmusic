/* eslint-disable @typescript-eslint/no-explicit-any */
export function DateTimePicker(props:any) {
  const { children } = props;
  return <input {...props}>{children}</input>;
}

export function DatePicker(props:any) {
  const { children, slotProps, dateAdapter, onChange, label, ...rest } = props;
  return <input aria-label={label} onChange={(e) => onChange(new Date(`${e.target.value}T00:00:00`))} {...rest}>{children}</input>;
}

export function LocalizationProvider(props:any) {
  const { children } = props;
  return <div {...props}>{children}</div>;
}
