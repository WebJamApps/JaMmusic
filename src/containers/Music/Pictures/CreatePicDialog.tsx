import {
  Button,
  Checkbox,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, FormGroup, FormControlLabel,
} from '@mui/material';
import { useState, useContext } from 'react';
import { AuthContext } from 'src/providers/Auth.provider';
import { DataContext } from 'src/providers/Data.provider';
import utils from './pictures.utils';

interface IcreatePicDialogProps {
  showDialog: boolean, setShowDialog: (arg0: boolean) => void,
}
export function CreatePicDialog({ showDialog, setShowDialog }: IcreatePicDialogProps) {
  const [pic, setPic] = useState({ url: '', comments: '', title: '' });
  const { auth } = useContext(AuthContext);
  const { getPics } = useContext(DataContext);
  return (
    <Dialog
      disableEnforceFocus
      disableAutoFocus
      className="createNewPicDialog"
      open={showDialog}
      onClose={() => setShowDialog(false)}
    >
      <DialogTitle>Create New Picture</DialogTitle>
      <DialogContent sx={{ padding: '10px 10px' }}>
        <DialogContentText sx={{ marginBottom: '30px' }}>
          Enter all *required fields to create a new picture.
        </DialogContentText>
        <TextField
          sx={{ marginTop: '20px' }}
          label="* URL"
          type="text"
          fullWidth
          value={pic.url}
          onChange={(evt) => { setPic({ ...pic, url: evt.target.value }); }}
        />
        <TextField
          sx={{ marginTop: '20px' }}
          label="* Title"
          type="text"
          fullWidth
          value={pic.title}
          onChange={(evt) => { setPic({ ...pic, title: evt.target.value }); }}
        />
        <FormGroup>
          <FormControlLabel
            control={(
              <Checkbox
                checked={pic.comments === 'showCaption'}
                onClick={
                  (evt: any) => {
                    const { target: { checked } } = evt;
                    // console.log(checked);
                    const comments = checked ? 'showCaption' : '';
                    // console.log(comments);
                    setPic({ ...pic, comments });
                  }
                }
              />
            )}
            label="Show Title In Caption"
          />
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button
          size="small"
          variant="contained"
          className="createPicButton"
          onClick={() => { utils.createPic(getPics, setShowDialog, pic, auth); }}
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
