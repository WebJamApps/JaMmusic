/* eslint-disable @typescript-eslint/no-explicit-any */
export function DateTimePicker(props:any) {
  const { children, label, ...rest } = props;
  // real MUI pickers expose `label` as the field's accessible name
  return <input aria-label={label} {...rest}>{children}</input>;
}

export function DatePicker(props:any) {
  const { children, slotProps, dateAdapter, onChange, label, ...rest } = props;
  return (
    <input
      aria-label={label}
      onChange={(e) => {
        const val = e.target.value;
        if (!val) {
          onChange(null);
        } else {
          onChange(new Date(`${val}T00:00:00`));
        }
      }}
      {...rest}
    >
      {children}
    </input>
  );
}

export function LocalizationProvider(props:any) {
  const { children } = props;
  return <div {...props}>{children}</div>;
}
