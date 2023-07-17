import { TextField } from '@mui/material';

interface IpicTextFieldProps {
  value: string,
  label:string,
  onChange:(arg0:any)=>any
}
export function PicTextField(props: IpicTextFieldProps) {
  const { value, onChange, label } = props;
  return (
    <TextField
      sx={{ marginTop: '20px' }}
      label={label}
      type="text"
      fullWidth
      value={value}
      onChange={onChange}
    />
  );
}
