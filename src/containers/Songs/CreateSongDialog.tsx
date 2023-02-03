import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField,
} from '@mui/material';
import { useState, useContext } from 'react';
import { AuthContext } from 'src/providers/Auth.provider';
import { DataContext } from 'src/providers/Data.provider';
import utils from './songs.utils';

interface IcreatePicDialogProps {
  showDialog: boolean, setShowDialog: (arg0: boolean) => void,
}
export function CreateSongDialog({ showDialog, setShowDialog }: IcreatePicDialogProps) {
  const [song, setSong] = useState({ url: '', comments: '', title: '' });
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
      <DialogTitle>Add New Song</DialogTitle>
      <DialogContent sx={{ padding: '10px 10px' }}>
        <DialogContentText sx={{ marginBottom: '30px' }}>
          Enter all *required fields to add a new song.
        </DialogContentText>
        <TextField
          sx={{ marginTop: '20px' }}
          label="* URL"
          type="text"
          fullWidth
          value={song.url}
          onChange={(evt) => { setSong({ ...song, url: evt.target.value }); }}
        />
        <TextField
          sx={{ marginTop: '20px' }}
          label="* Title"
          type="text"
          fullWidth
          value={song.title}
          onChange={(evt) => { setSong({ ...song, title: evt.target.value }); }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          size="small"
          variant="contained"
          className="createSongButton"
          onClick={() => { utils.createSong(getSongs, setShowDialog, song, auth); }}
        >
          Create
        </Button>
        <Button
          size="small"
          className="cancelPicButton"
          onClick={() => setShowDialog(false)}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
