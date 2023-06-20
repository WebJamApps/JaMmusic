import {
  Button,
  Checkbox,
  Dialog, DialogActions, DialogContent, DialogTitle, TextField, FormGroup, FormControlLabel, CircularProgress,
} from '@mui/material';
import { useContext, useState } from 'react';
import { AuthContext } from 'src/providers/Auth.provider';
import { DataContext } from 'src/providers/Data.provider';
import utils, { defaultEditPic } from './pictures.utils';

export const makeShowHideCaption = (setPic: (arg0: typeof defaultEditPic) => void, pic: typeof defaultEditPic) => (evt: any) => {
  const { target: { checked } } = evt;
  const comments = checked ? 'showCaption' : '';
  setPic({ ...pic, comments });
};

interface IpicTextFieldProps {
  value: string,
  label:string,
  onChange:(arg0:any)=>any
}
export function PicTextField(props: IpicTextFieldProps) {
  const { value, onChange, label } = props;
  return (
    <TextField
      sx={{ marginTop: '20px' }}
      label={label}
      type="text"
      fullWidth
      value={value}
      onChange={onChange}
    />
  );
}

function checkDisabled(editPic: typeof defaultEditPic):boolean {
  return !!(editPic.title && editPic.url);
}

interface IeditPicDialogProps {
  setShowTable:(arg0:boolean)=>void,
  editPic: typeof defaultEditPic, setEditPic: (arg0: typeof defaultEditPic) => void,
}
export function EditPicDialog({ editPic, setEditPic, setShowTable }: IeditPicDialogProps) {
  const { auth } = useContext(AuthContext);
  const { getPics } = useContext(DataContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showHideCaption = makeShowHideCaption(setEditPic, editPic);
  return (
    <Dialog
      disableEnforceFocus
      disableAutoFocus
      className="editPicDialog"
      open={!!editPic._id}
      onClose={() => setEditPic(defaultEditPic)}
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
              className="createPicButton"
              onClick={() => { utils.deletePic(editPic._id, auth, getPics, { setEditPic, setShowTable, setIsSubmitting }); }}
            >
              Delete
            </Button>
            <Button
              size="small"
              className="cancelPicButton"
              onClick={() => { setEditPic(defaultEditPic); }}
            >
              Cancel
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

