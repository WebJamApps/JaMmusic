
interface WjDropdownProps {
  onChange: (event: any) => void,
  options: string[],
  htmlFor?: string,
  label?: string,
  value?: string,
  style?: Record<string, unknown>,
  disabled?: boolean
}
export const WjDropdown = (props: WjDropdownProps) => {
  const {
    style, htmlFor, label, onChange, value, options, disabled,
  } = props;
  return (
    <select
      disabled={disabled || false}
      style={style}
      id={htmlFor || ''}
      // no visible <label> exists for this control, so expose one to
      // assistive tech (axe select-name)
      aria-label={label || htmlFor}
      multiple={false}
      onChange={(event) => onChange(event)}
      value={value}
    >
      {
        options.map((cv) => <option id={cv} key={cv} value={cv}>{cv}</option>)
      }
    </select>
  );
};
