import {
  Button,
  Checkbox,
  Dialog, DialogActions, DialogContent, DialogTitle, FormGroup, FormControlLabel, CircularProgress,
} from '@mui/material';
import { useContext, useState } from 'react';
import { AuthContext } from 'src/providers/Auth.provider';
import { DataContext } from 'src/providers/Data.provider';
import utils, { defaultPic } from './pictures.utils';
import { PicTextField } from './PicTextField';

function checkDisabled(editPic: typeof defaultPic):boolean {
  return !!(editPic.title && editPic.url);
}

interface IeditPicDialogProps {
  setShowTable:(arg0:boolean)=>void,
  editPic: typeof defaultPic, setEditPic: (arg0: typeof defaultPic) => void,
}
export function EditPicDialog({ editPic, setEditPic, setShowTable }: IeditPicDialogProps) {
  const { auth } = useContext(AuthContext);
  const { getPics } = useContext(DataContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showHideCaption = utils.makeShowHideCaption(setEditPic, editPic);
  return (
    <Dialog
      disableEnforceFocus
      disableAutoFocus
      className="editPicDialog"
      open={!!editPic._id}
      onClose={() => setEditPic(defaultPic)}
    >
      <DialogTitle>Edit Picture</DialogTitle>
      <DialogContent sx={{ padding: '10px 10px' }}>
        <PicTextField
          value={editPic.url}
          label="* URL"
          onChange={(evt) => {
            const { target: { value } } = evt;
            setEditPic({ ...editPic, url: value });
            return value;
          }}
        />
        <PicTextField
          value={editPic.title}
          label="* Title"
          onChange={(evt) => {
            const { target: { value } } = evt;
            setEditPic({ ...editPic, title: value });
            return value;
          }}
        />
        <FormGroup>
          <FormControlLabel
            control={(
              <Checkbox
                checked={editPic.comments === 'showCaption'}
                onClick={showHideCaption}
              />
              )}
            label="Show Title In Caption"
          />
        </FormGroup>
      </DialogContent>
      <DialogActions>
        {isSubmitting ? <CircularProgress /> : (
          <>
            <Button
              disabled={!checkDisabled(editPic)}
              size="small"
              variant="contained"
              className="createPicButton"
              onClick={() => { utils.updatePic(editPic, auth, getPics, setEditPic, setShowTable, setIsSubmitting); }}
            >
              Update
            </Button>
            <Button
              style={{ color: 'red' }}
              size="small"
              id="delete"
              className="createPicButton"
              onClick={() => { utils.deletePic(editPic._id || '', auth, getPics, { setEditPic, setShowTable, setIsSubmitting }); }}
            >
              Delete
            </Button>
            <Button
              size="small"
              className="cancelPicButton"
              onClick={() => { setEditPic(defaultPic); }}
            >
              Cancel
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

