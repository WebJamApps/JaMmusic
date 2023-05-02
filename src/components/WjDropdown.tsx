
interface WjDropdownProps {
  onChange: (event: any) => void,
  options: string[],
  htmlFor?: string,
  value?: string,
  style?: Record<string, unknown>,
  disabled?: boolean
}
export const WjDropdown = (props: WjDropdownProps): JSX.Element => {
  const {
    style, htmlFor, onChange, value, options, disabled,
  } = props;
  return (
    <select
      disabled={disabled || false}
      style={style}
      id={htmlFor || ''}
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
