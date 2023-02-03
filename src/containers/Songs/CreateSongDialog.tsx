import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField,
} from '@mui/material';
import { useState, useContext } from 'react';
import { AuthContext } from 'src/providers/Auth.provider';
import { DataContext, Isong } from 'src/providers/Data.provider';
import utils from './songs.utils';

// artist?: string;
//   composer?: string;
//   category: string;
//   album?: string;
//   year: number;
//   image?: string;
//   title: string;
//   url: string;
//   _id?: string;
//   modify?: JSX.Element

interface IcreatePicDialogProps {
  showDialog: boolean, setShowDialog: (arg0: boolean) => void,
}
export function CreateSongDialog({ showDialog, setShowDialog }: IcreatePicDialogProps) {
  const [song, setSong] = useState({
    url: '',
    title: '',
    category: 'original',
    year: new Date().getFullYear(),
    artist: 'Josh & Maria Sherman',
    composer: 'Josh & Maria Sherman',
    album: '',
    image: '',
  } as Isong);
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
        <TextField
          label="* Url"
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
        <TextField
          sx={{ marginTop: '20px' }}
          label="* Artist"
          type="text"
          fullWidth
          value={song.artist}
          onChange={(evt) => { setSong({ ...song, artist: evt.target.value }); }}
        />
        <TextField
          sx={{ marginTop: '20px' }}
          label="* Year"
          type="number"
          fullWidth
          value={song.year}
          onChange={(evt) => { setSong({ ...song, year: Number(evt.target.value) }); }}
        />
        <FormControl fullWidth sx={{ marginTop: '20px' }}>
          <InputLabel id="select-category-label">Category</InputLabel>
          <Select
            labelId="select-category-label"
            id="select-category"
            value={song.category}
            label="Category"
            onChange={(evt) => { setSong({ ...song, category: evt.target.value }); }}
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
          onChange={(evt) => { setSong({ ...song, composer: evt.target.value }); }}
        />
        <TextField
          sx={{ marginTop: '20px' }}
          label="Album"
          type="text"
          fullWidth
          value={song.album}
          onChange={(evt) => { setSong({ ...song, album: evt.target.value }); }}
        />
        <TextField
          sx={{ marginTop: '20px' }}
          label="Image"
          type="text"
          fullWidth
          value={song.image}
          onChange={(evt) => { setSong({ ...song, image: evt.target.value }); }}
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
