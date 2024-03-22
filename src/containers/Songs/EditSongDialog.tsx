import {
  Button, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField,
} from '@mui/material';
import { useState, useContext } from 'react';
import { AuthContext } from 'src/providers/Auth.provider';
import { DataContext, Isong } from 'src/providers/Data.provider';
import utils, { defaultSong } from './songs.utils';

interface IsongFieldProps {
  label: string,
  value: string,
  onChange: (arg0: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => string
}
function SongField(props: IsongFieldProps): JSX.Element {
  const { label, value, onChange } = props;
  return (
    <TextField
      style={{ marginBottom: '12px' }}
      label={label}
      type="text"
      fullWidth
      value={value}
      onChange={onChange}
    />
  );
}

interface IeditSongDialogProps {
  editDialogState: { showEditDialog: boolean, setShowEditDialog: (arg0: boolean) => void }, eSong: Isong
}
export function EditSongDialog({ editDialogState, eSong }: IeditSongDialogProps) {
  console.log(eSong);
  const [song, setSong] = useState(eSong);
  const { auth } = useContext(AuthContext);
  const { getSongs } = useContext(DataContext);
  const { showEditDialog, setShowEditDialog } = editDialogState;
  return (
    <Dialog
      disableEnforceFocus
      disableAutoFocus
      className="createNewPicDialog"
      open={showEditDialog}
      onClose={() => setShowEditDialog(false)}
    >
      <DialogTitle sx={{ textAlign: 'center' }}>Edit Song</DialogTitle>
      <DialogContent sx={{ padding: '10px 10px' }}>
        <DialogContentText sx={{ marginBottom: '10px' }}>
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
          value={song.artist}
          onChange={(evt) => {
            const { target: { value } } = evt;
            setSong({ ...song, artist: value });
            return value;
          }}
        />
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
        <FormControl fullWidth sx={{ marginBottom: '12px' }}>
          <InputLabel id="select-category-label">Category</InputLabel>
          <Select
            style={{ marginBottom: '12px' }}
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
          sx={{ marginBottom: '12px' }}
          label="Composer"
          type="text"
          fullWidth
          value={song.composer}
          onChange={(evt) => utils.handleInputChange(evt, setSong, song, 'composer')}
        />
        <SongField
          label="Album"
          value={song.album || ''}
          onChange={(evt) => {
            const { target: { value } } = evt;
            setSong({ ...song, album: value });
            return value;
          }}
        />
        <TextField
          sx={{ marginBottom: '12px' }}
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
        <TextField
          sx={{ marginBottom: '12px' }}
          label="Order (highest number plays first)"
          type="number"
          fullWidth
          value={song.orderBy}
          onChange={(evt) => {
            const { target: { value } } = evt;
            const orderBy = !value ? 0 : Number(value);
            setSong({ ...song, orderBy });
            return orderBy;
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          disabled={utils.checkDisabled(song)}
          size="small"
          variant="contained"
          className="createSongButton"
          onClick={() => { utils.createSong(getSongs, setShowEditDialog, song, setSong, auth); }}
        >
          Update
        </Button>
        <Button
          size="small"
          className="cancelPicButton"
          onClick={() => { setSong(defaultSong); setShowEditDialog(false); }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
