import {
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import type { Igig } from 'src/providers/Data.provider';
import utils from './gigs.utils';

interface IusStateDropDownProps {
  editGig: Igig, setEditChanged: (arg0: boolean) => void, setEditGig: (arg0: Igig) => void
}
export const UsStateDropDown = (props: IusStateDropDownProps) => {
  const { editGig, setEditChanged, setEditGig } = props;
  return (
    <FormControl fullWidth sx={{ marginTop: '20px' }}>
      <InputLabel id="edit-us-state-label">* State</InputLabel>
      <Select
        labelId="edit-us-state-label"
        id="edit-us-state"
        value={editGig.usState}
        label="* State"
        onChange={(evt) => {
          setEditChanged(true);
          setEditGig({ ...editGig, usState: evt.target.value }); return evt.target.value;
        }}
      >
        {utils.usStateOptions.map((s: string) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
      </Select>
    </FormControl>
  );
};
