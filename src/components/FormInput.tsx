import { TextField } from '@mui/material';

interface IformInputProps {
  type: string | undefined,
  label: string, isRequired: boolean | undefined,
  onChange: ((event: React.ChangeEvent<HTMLInputElement>) => void) | undefined,
  value: string, style?: any
}
export const FormInput = (props:IformInputProps): JSX.Element => {
  const { label, style, isRequired, type, onChange, value } = props;
  let fId = label.toLowerCase();
  fId = fId.replace(/\s/g, '');
  const fIdArr = fId.split('(');
  // eslint-disable-next-line prefer-destructuring
  fId = fIdArr[0];
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
