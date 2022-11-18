import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField,
} from '@mui/material';
import type { Igig } from 'src/providers/Data.provider';
import { defaultGig } from 'src/providers/fetchGigs';
import { Editor } from '@tinymce/tinymce-react';
import type { Iauth } from 'src/providers/Auth.provider';
import utils from './gigs.utils';
import { UsStateDropDown } from './UsStateDropDown';

interface IeditTextProps {
  objKey: 'city' | 'tickets',
  editGig: typeof defaultGig,
  setEditChanged: (arg0: boolean) => void,
  setEditGig: (arg0: typeof defaultGig) => void,
  required: boolean
}
export const EditText = (props: IeditTextProps) => {
  const {
    objKey, editGig, setEditChanged, setEditGig, required,
  } = props;
  let label = required ? '* ' : '';
  label = label + objKey.charAt(0).toUpperCase() + objKey.slice(1);
  return (
    <TextField
      label={label}
      type="text"
      fullWidth
      sx={{ marginTop: '20px' }}
      // eslint-disable-next-line security/detect-object-injection
      value={editGig[objKey]}
      onChange={(evt) => {
        setEditChanged(true);
        setEditGig({ ...editGig, [objKey]: evt.target.value });
      }}
    />
  );
};

interface IvenueEditorProps {
  editGig: typeof defaultGig, setEditChanged: (arg0: boolean) => void,
  setEditGig: (arg0: typeof defaultGig) => void
}
export const VenueEditor = ({ editGig, setEditChanged, setEditGig }: IvenueEditorProps) => {
  if (!editGig._id) return null;
  return (
    <Editor
      id="edit-venue"
      value={editGig.venue}
      apiKey={process.env.TINY_KEY}
      init={{
        height: 500,
        menubar: 'insert tools',
        menu: { format: { title: 'Format', items: 'forecolor backcolor' } },
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
          'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
        ],
        toolbar:
          'undo redo | formatselect | bold italic backcolor forecolor |'
          + 'alignleft aligncenter alignright alignjustify |'
          + 'bullist numlist outdent indent | removeformat | help',
      }}
      onEditorChange={(text: string) => {
        if (text !== `<p>${editGig.venue}</p>`) {
          setEditChanged(true);
          setEditGig({ ...editGig, venue: text });
          return text;
        }
        return '';
      }}
    />
  );
};

interface IbuttonsSectionProps {
  editGig: Igig, setEditGig: (arg0: Igig) => void, getGigs: () => void,
  editChanged: boolean, setEditChanged: (arg0: boolean) => void, auth: Iauth
}
export const ButtonsSection = (props: IbuttonsSectionProps) => {
  const {
    editGig, editChanged, getGigs, setEditGig, setEditChanged, auth,
  } = props;
  return (
    <DialogActions>
      <Button
        disabled={utils.checkUpdateDisabled(editGig, editChanged)}
        size="small"
        variant="contained"
        className="updateGigButton"
        onClick={() => {
          utils.updateGig(getGigs, setEditGig, setEditChanged, editGig, auth.token);
        }}
      >
        Update
      </Button>
      <Button
        size="small"
        className="deleteGigButton"
        sx={{ color: 'red' }}
        onClick={() => {
          setEditChanged(false);
          utils.deleteGig(editGig._id || '', getGigs, setEditGig, setEditChanged, auth.token);
        }}
      >
        Delete
      </Button>
      <Button
        size="small"
        className="cancelEditGigButton"
        onClick={() => {
          setEditChanged(false);
          setEditGig(defaultGig);
          return false;
        }}
      >
        Cancel
      </Button>
    </DialogActions>
  );
};

interface IeditGigDialogProps {
  editGig: Igig, setEditGig: (arg0: Igig) => void, setShowDialog: (arg0: boolean) => void,
  setEditChanged: (arg0: boolean) => void, editChanged: boolean, getGigs: () => void, auth: Iauth
}
export function EditGigDialog(props: IeditGigDialogProps) {
  const {
    editGig, setEditGig, setShowDialog, setEditChanged, editChanged, getGigs, auth,
  } = props;
  return (
    <Dialog
      disableEnforceFocus
      disableAutoFocus
      className="editGigDialog"
      open={!!editGig._id}
      onClose={() => setShowDialog(false)}
    >
      <DialogTitle>Edit Gig</DialogTitle>
      <DialogContent sx={{ padding: '10px 10px' }}>
        <DialogContentText sx={{ marginBottom: '30px' }}>Enter all *required</DialogContentText>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            className="editDateTime"
            label="* Date and Time"
            value={editGig.datetime}
            onChange={(newValue: Date | null) => {
              setEditChanged(true);
              setEditGig({ ...editGig, datetime: newValue }); return newValue;
            }}
            renderInput={(params) => <TextField className="dateTimeInput" {...params} />}
          />
        </LocalizationProvider>
        <p className="venueLabel">* Venue</p>
        <VenueEditor editGig={editGig} setEditChanged={setEditChanged} setEditGig={setEditGig} />
        <EditText objKey="city" editGig={editGig} setEditChanged={setEditChanged} setEditGig={setEditGig} required />
        <UsStateDropDown editGig={editGig} setEditChanged={setEditChanged} setEditGig={setEditGig} />
        <EditText objKey="tickets" editGig={editGig} setEditChanged={setEditChanged} setEditGig={setEditGig} required={false} />
      </DialogContent>
      <ButtonsSection
        editGig={editGig}
        editChanged={editChanged}
        getGigs={getGigs}
        setEditGig={setEditGig}
        setEditChanged={setEditChanged}
        auth={auth}
      />
    </Dialog>
  );
}
