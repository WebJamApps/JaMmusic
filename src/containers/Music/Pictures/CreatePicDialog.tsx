import {
  Button,
  Checkbox,
  Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, FormGroup, FormControlLabel,
} from '@mui/material';
import { useState, useContext } from 'react';
import { AuthContext } from 'src/providers/Auth.provider';
import { DataContext } from 'src/providers/Data.provider';
import utils, { defaultPic } from './pictures.utils';
import { PicTextField } from './PicTextField';

interface IcreatePicDialogProps {
  showDialog: boolean, setShowDialog: (arg0: boolean) => void,
}
export function CreatePicDialog({ showDialog, setShowDialog }: IcreatePicDialogProps) {
  const [pic, setPic] = useState(defaultPic);
  const { auth } = useContext(AuthContext);
  const { getPics } = useContext(DataContext);
  const showHideCaption = utils.makeShowHideCaption(setPic, pic);
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
        <PicTextField
          value={pic.url}
          label="* URL"
          onChange={(evt) => {
            const { target: { value } } = evt;
            setPic({ ...pic, url: value });
            return value;
          }}
        />
        <PicTextField
          value={pic.title}
          label="* Title"
          onChange={(evt) => {
            const { target: { value } } = evt;
            setPic({ ...pic, title: value });
            return value;
          }}
        />
        <FormGroup>
          <FormControlLabel
            control={(
              <Checkbox
                checked={pic.comments === 'showCaption'}
                onClick={showHideCaption}
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
          onClick={() => { setPic(defaultPic); setShowDialog(false); }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
