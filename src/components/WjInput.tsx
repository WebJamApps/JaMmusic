import { TextField } from '@mui/material';

interface IwjinputProps {
  label: string,
  id?: string,
  onChange?: ((event: React.ChangeEvent<HTMLInputElement>) => void)
  type?: string,
  isRequired?: boolean,
  value?: string,
  style?: Record<string, unknown>,
}
export const WjInput = (props: IwjinputProps) => {
  const {
    label, style, isRequired, type, onChange, value, id,
  } = props;
  const fId = label.toLowerCase().replace(/\s/g, '');
  const fIdArr = fId.split('(');
  const tfId = fIdArr[0].trim();
  const inputId = id || tfId;
  return (
    <TextField
      style={style}
      id={inputId}
      placeholder={isRequired ? '* '.concat(label) : label}
      type={type}
      name={id || fId}
      onChange={onChange}
      value={value || ''}
    />
  );
};
