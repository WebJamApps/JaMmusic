import {
  Button, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, TextField,
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from 'src/providers/Auth.provider';
import { DataContext, Isong } from 'src/providers/Data.provider';
import { CategorySelect } from 'src/components/CategorySelect';
import { YearField } from 'src/components/YearField';
import { checkIsAdmin } from '../Music';
import utils from './songs.utils';

interface IsongFieldProps {
  label: string,
  value: string,
  onChange: (arg0: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => string
}
function SongField(props: IsongFieldProps): React.JSX.Element {
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
  editSongState: { editSong: Isong, setEditSong: React.Dispatch<React.SetStateAction<Isong>> },
  currentSong: Isong
}
export function EditSongDialog({ editDialogState, editSongState, currentSong }: IeditSongDialogProps) {
  const { auth } = useContext(AuthContext);
  const { getSongs } = useContext(DataContext);
  const { showEditDialog, setShowEditDialog } = editDialogState;
  const { editSong, setEditSong } = editSongState;
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => { checkIsAdmin(auth, setIsAdmin); }, [auth]);
  useEffect(() => {
    setEditSong(currentSong);
  }, [currentSong, setEditSong]);
  if (!editSong || !editSong._id) return null;
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
        <YearField song={editSong} setSong={setEditSong} />
        <CategorySelect songJson={editSong} setFunc={setEditSong} />
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
          value={editSong.orderBy || ''}
          onChange={(evt) => {
            const { target: { value } } = evt;
            setEditSong({ ...editSong, orderBy: Number(value) });
            return value;
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
        {isAdmin ? (
          <Button
            size="small"
            variant="contained"
            color="error"
            className="deleteSongButton"
            onClick={() => { utils.deleteSong(getSongs, setShowEditDialog, editSong, auth); }}
          >
            Delete
          </Button>
        ) : null}
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
