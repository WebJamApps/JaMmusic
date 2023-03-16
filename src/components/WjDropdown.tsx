
interface WjDropdownProps {
  onChange: (event: any) => void,
  options: string[],
  htmlFor?: string,
  value?: string,
  style?: Record<string, unknown>,
}
export const WjDropdown = (props: WjDropdownProps): JSX.Element => {
  const {
    style, htmlFor, onChange, value, options,
  } = props;
  return (
    <select
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
