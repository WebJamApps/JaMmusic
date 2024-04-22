import {
  Button, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField,
} from '@mui/material';
import { useContext, useEffect } from 'react';
import { AuthContext } from 'src/providers/Auth.provider';
import { DataContext, Isong } from 'src/providers/Data.provider';
import utils from './songs.utils';

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
  editDialogState: { showEditDialog: boolean, setShowEditDialog: (arg0: boolean) => void },
  editSongState: { editSong: Isong, setEditSong: (arg0: Isong) => void },
  currentSong: Isong
}
export function EditSongDialog({ editDialogState, editSongState, currentSong }: IeditSongDialogProps) {
  const { auth } = useContext(AuthContext);
  const { getSongs } = useContext(DataContext);
  const { showEditDialog, setShowEditDialog } = editDialogState;
  const { editSong, setEditSong } = editSongState;
  console.log(currentSong);
  useEffect(() => {
    setEditSong(currentSong);
  }, [currentSong, setEditSong]);
  if (!editSong._id) return null;
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
          value={editSong.url}
          onChange={(evt) => {
            const { target: { value } } = evt;
            setEditSong({ ...editSong, url: value });
            return value;
          }}
        />
        <SongField
          label="* Title"
          value={editSong.title}
          onChange={(evt) => {
            const { target: { value } } = evt;
            setEditSong({ ...editSong, title: value });
            return value;
          }}
        />
        <SongField
          label="* Artist"
          value={editSong.artist}
          onChange={(evt) => {
            const { target: { value } } = evt;
            setEditSong({ ...editSong, artist: value });
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
          value={editSong.year}
          onChange={(evt) => {
            const { target: { value } } = evt;
            const numValue = Number(value);
            const year = numValue > 1 ? numValue : 2;
            setEditSong({ ...editSong, year });
            return year;
          }}
        />
        <FormControl fullWidth sx={{ marginBottom: '12px' }}>
          <InputLabel id="select-category-label">Category</InputLabel>
          <Select
            style={{ marginBottom: '12px' }}
            labelId="select-category-label"
            id="select-category"
            value={editSong.category}
            label="Category"
            onChange={(evt) => {
              const { target: { value } } = evt;
              setEditSong({ ...editSong, category: value });
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
          value={editSong.composer}
          onChange={(evt) => utils.handleInputChange(evt, setEditSong, editSong, 'composer')}
        />
        <SongField
          label="Album"
          value={editSong.album || ''}
          onChange={(evt) => {
            const { target: { value } } = evt;
            setEditSong({ ...editSong, album: value });
            return value;
          }}
        />
        <TextField
          sx={{ marginBottom: '12px' }}
          label="Image"
          type="text"
          fullWidth
          value={editSong.image}
          onChange={(evt) => {
            const { target: { value } } = evt;
            setEditSong({ ...editSong, image: value });
            return value;
          }}
        />
        <TextField
          sx={{ marginBottom: '12px' }}
          label="Order (highest number plays first)"
          type="number"
          fullWidth
          value={editSong.orderBy || 0}
          onChange={(evt) => {
            const { target: { value } } = evt;
            const orderBy = !value ? 0 : Number(value);
            setEditSong({ ...editSong, orderBy });
            return orderBy;
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          disabled={utils.checkDisabled(editSong)}
          size="small"
          variant="contained"
          className="createSongButton"
          onClick={() => { utils.updateSong(getSongs, setShowEditDialog, editSong, setEditSong, auth); }}
        >
          Update
        </Button>
        <Button
          size="small"
          className="cancelPicButton"
          onClick={() => { setShowEditDialog(false); }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
