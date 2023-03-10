import { TextField } from '@mui/material';

interface IwjinputProps {
  label: string,
  onChange?: ((event: React.ChangeEvent<HTMLInputElement>) => void)
  type?: string,
  isRequired?: boolean,
  value?: string,
  style?:Record<string, unknown>,
}
export const WjInput = (props:IwjinputProps): JSX.Element => {
  const {
    label, style, isRequired, type, onChange, value,
  } = props;
  let fId = label.toLowerCase();
  fId = fId.replace(/\s/g, '');
  const fIdArr = fId.split('(');
  fId = fIdArr[0]; // eslint-disable-line prefer-destructuring
  return (
    <TextField
      style={style}
      id={fId}
      placeholder={isRequired ? '* '.concat(label) : label}
      type={type}
      name={fId}
      onChange={onChange}
      value={value || ''}
    />
  );
};
