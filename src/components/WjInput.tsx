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
  const fId = label.toLowerCase().replace(/\s/g, '');
  const fIdArr = fId.split('(');
  const tfId = fIdArr[0].trim();
  return (
    <TextField
      style={style}
      id={tfId}
      placeholder={isRequired ? '* '.concat(label) : label}
      type={type}
      name={fId}
      onChange={onChange}
      value={value || ''}
    />
  );
};
