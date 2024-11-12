import {
  FormControl, InputLabel, MenuItem, Select,
} from '@mui/material';
import { Isong } from 'src/providers/Data.provider';

export function CategorySelect({ songJson, setFunc }:
{ songJson: Isong, setFunc: (arg0: Isong) => void }) {
  return (
    <FormControl fullWidth sx={{ marginBottom: '12px' }}>
      <InputLabel id="select-category-label">Category</InputLabel>
      <Select
        style={{ marginBottom: '12px' }}
        labelId="select-category-label"
        id="select-category"
        value={songJson.category}
        label="Category"
        onChange={(evt) => {
          const { target: { value } } = evt;
          setFunc({ ...songJson, category: value });
          return value;
        }}
      >
        <MenuItem value="original">original</MenuItem>
        <MenuItem value="mission">mission</MenuItem>
        <MenuItem value="pub">pub</MenuItem>
      </Select>
    </FormControl>
  );
}
