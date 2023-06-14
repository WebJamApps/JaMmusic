import {
  Button,
  Checkbox,
  Dialog, DialogActions, DialogContent, DialogTitle, TextField, FormGroup, FormControlLabel,
} from '@mui/material';
import { useContext } from 'react';
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
  editPic: typeof defaultEditPic, setEditPic: (arg0: typeof defaultEditPic) => void,
}
export function EditPicDialog({ editPic, setEditPic }: IeditPicDialogProps) {
  const { auth } = useContext(AuthContext);
  const { getPics } = useContext(DataContext);
  const showHideCaption = makeShowHideCaption(setEditPic, editPic);
  return (
    <Dialog
      disableEnforceFocus
      disableAutoFocus
      className="editPicDialog"
      open={!!editPic.id}
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
        <Button
          disabled={!checkDisabled(editPic)}
          size="small"
          variant="contained"
          className="createPicButton"
          onClick={() => { utils.updatePic(editPic, auth, getPics, setEditPic); }}
        >
          Update
        </Button>
        <Button
          style={{ color: 'red' }}
          size="small"
          className="createPicButton"
          onClick={() => { console.log('delete'); }}
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
      </DialogActions>
    </Dialog>
  );
}

