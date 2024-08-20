import {
  Button, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, TextField,
} from '@mui/material';
import { useState, useContext } from 'react';
import { AuthContext } from 'src/providers/Auth.provider';
import { DataContext, Isong } from 'src/providers/Data.provider';
import { CategorySelect } from 'src/components/CategorySelect';
import { YearField } from 'src/components/YearField';
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
      style={{ marginBottom: '12px' }}
      label={label}
      type="text"
      fullWidth
      value={value}
      onChange={onChange}
    />
  );
}

interface IcreateSongDialogProps {
  showDialog: boolean, setShowDialog: (arg0: boolean) => void,
}
export function CreateSongDialog({ showDialog, setShowDialog }: IcreateSongDialogProps) {
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
        <YearField song={song} setSong={setSong} />
        <CategorySelect songJson={song} setFunc={setSong} />
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
