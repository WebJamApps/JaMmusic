import {
  Button, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField,
} from '@mui/material';
import { useState, useContext } from 'react';
import { AuthContext } from 'src/providers/Auth.provider';
import { DataContext, Isong } from 'src/providers/Data.provider';
import utils, { defaultSong } from './songs.utils';

interface IsongFieldProps {
  label:string,
  value:string,
  onChange:(arg0:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>string
}
function SongField(props:IsongFieldProps):JSX.Element {
  const { label, value, onChange } = props;
  return (
    <TextField
      label={label}
      type="text"
      fullWidth
      value={value}
      onChange={onChange}
    />
  );
}

interface IcreatePicDialogProps {
  showDialog: boolean, setShowDialog: (arg0: boolean) => void,
}
export function CreateSongDialog({ showDialog, setShowDialog }: IcreatePicDialogProps) {
  const [song, setSong] = useState(defaultSong as Isong);
  const { auth } = useContext(AuthContext);
  const { getSongs } = useContext(DataContext);
  return (
    <Dialog
      disableEnforceFocus
      disableAutoFocus
      className="createNewPicDialog"
      open={showDialog}
      onClose={() => setShowDialog(false)}
    >
      <DialogTitle sx={{ textAlign: 'center' }}>Add New Song</DialogTitle>
      <DialogContent sx={{ padding: '10px 10px' }}>
        <DialogContentText sx={{ marginBottom: '30px' }}>
          Enter all *Required fields to add a new song.
        </DialogContentText>
        <SongField
          label="* Url"
          value={song.url}
          onChange={(evt) => {
            const { target: { value } } = evt;
            setSong({ ...song, url: value });
            return value;
          }}
        />
        <SongField
          label="* Title"
          value={song.title}
          onChange={(evt) => {
            const { target: { value } } = evt;
            setSong({ ...song, title: value });
            return value;
          }}
        />
        <SongField
          label="* Artist"
          value={song.artist || ''}
          onChange={(evt) => {
            const { target: { value } } = evt;
            setSong({ ...song, artist: value });
            return value;
          }}
        />
        <TextField
          sx={{ marginTop: '20px' }}
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
            setSong({ ...song, year: numValue > 1 ? numValue : 2 });
            return numValue;
          }}
        />
        <FormControl fullWidth sx={{ marginTop: '20px' }}>
          <InputLabel id="select-category-label">Category</InputLabel>
          <Select
            labelId="select-category-label"
            id="select-category"
            value={song.category}
            label="Category"
            onChange={(evt) => {
              const { target: { value } } = evt;
              setSong({ ...song, category: value });
              return value;
            }}
          >
            <MenuItem value="original">original</MenuItem>
            <MenuItem value="mission">mission</MenuItem>
            <MenuItem value="pub">pub</MenuItem>
          </Select>
        </FormControl>
        <TextField
          sx={{ marginTop: '20px' }}
          label="Composer"
          type="text"
          fullWidth
          value={song.composer}
          onChange={(evt) => {
            const { target: { value } } = evt;
            setSong({ ...song, composer: value });
            return value;
          }}
        />
        <TextField
          sx={{ marginTop: '20px' }}
          label="Album"
          type="text"
          fullWidth
          value={song.album}
          onChange={(evt) => {
            const { target: { value } } = evt;
            setSong({ ...song, album: value });
            return value;
          }}
        />
        <TextField
          sx={{ marginTop: '20px' }}
          label="Image"
          type="text"
          fullWidth
          value={song.image}
          onChange={(evt) => {
            const { target: { value } } = evt;
            setSong({ ...song, image: value });
            return value;
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          disabled={utils.checkDisabled(song)}
          size="small"
          variant="contained"
          className="createSongButton"
          onClick={() => { utils.createSong(getSongs, setShowDialog, song, setSong, auth); }}
        >
          Create
        </Button>
        <Button
          size="small"
          className="cancelPicButton"
          onClick={() => { setSong(defaultSong); setShowDialog(false); }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
