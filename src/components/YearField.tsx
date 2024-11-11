import { TextField } from '@mui/material';
import { Isong } from 'src/providers/Data.provider';

export function YearField({ song, setSong }: { song: Isong, setSong: (arg0: Isong) => void }) {
  return (
    <TextField
      sx={{ marginBottom: '12px' }}
      label="* Year"
      type="number"
      InputProps={{
        inputProps: {
          max: new Date().getFullYear(), min: 2000,
        },
      }}
      fullWidth
      value={song.year}
      onChange={(evt) => {
        const { target: { value } } = evt;
        const numValue = Number(value);
        const year = numValue > 1 ? numValue : 2;
        setSong({ ...song, year });
        return year;
      }}
    />
  );
}
