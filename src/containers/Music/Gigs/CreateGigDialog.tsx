import {
  DialogActions, Button,
  Dialog, DialogTitle, DialogContent, DialogContentText, TextField, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Editor } from '@tinymce/tinymce-react';
import { useContext, useState } from 'react';
import { DataContext } from 'src/providers/Data.provider';
import { AuthContext } from 'src/providers/Auth.provider';
import utils from './gigs.utils';

interface IcreateGigDialogProps {
  showDialog: boolean, setShowDialog: (arg0: boolean) => void,
}
export function CreateGigDialog({
  showDialog, setShowDialog,
}: IcreateGigDialogProps) {
  const { auth } = useContext(AuthContext);
  const { getGigs } = useContext(DataContext);
  const now = new Date() as Date | null;
  const [dateTime, setDateTime] = useState(now);
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [usState, setUSstate] = useState('Virginia');
  const [tickets, setTickets] = useState('');
  return (
    <Dialog
      disableEnforceFocus
      disableAutoFocus
      className="createNewGigDialog"
      open={showDialog}
      onClose={() => { setShowDialog(false); return false; }}
    >
      <DialogTitle>Create New Gig</DialogTitle>
      <DialogContent sx={{ padding: '10px 10px' }}>
        <DialogContentText sx={{ marginBottom: '30px' }}>
          Enter all *required fields to create a new gig.
        </DialogContentText>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            className="createDatetime"
            label="* Date and Time"
            value={dateTime}
            onChange={(newValue: Date | null) => { setDateTime(newValue); return newValue; }}
            renderInput={(params) => <TextField className="dateTimeInput" {...params} />}
          />
        </LocalizationProvider>
        <p className="venueLabel">* Venue</p>
        <Editor
          id="create-venue"
          value={venue}
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
          onEditorChange={(text) => { setVenue(text); return text; }}
        />
        <TextField
          sx={{ marginTop: '20px' }}
          label="* City"
          type="text"
          fullWidth
          value={city}
          onChange={(evt) => { setCity(evt.target.value); return evt.target.value; }}
        />
        <FormControl fullWidth sx={{ marginTop: '20px' }}>
          <InputLabel id="create-us-state-label">* State</InputLabel>
          <Select
            labelId="create-us-state-label"
            id="create-us-state"
            value={usState}
            label="* State"
            onChange={(evt) => { setUSstate(evt.target.value); return evt.target.value; }}
          >
            {utils.usStateOptions.map((s: string) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField
          sx={{ marginTop: '20px' }}
          label="Tickets"
          type="text"
          fullWidth
          value={tickets}
          onChange={(evt) => { setTickets(evt.target.value); return evt.target.value; }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          disabled={utils.checkNewDisabled(city, usState, dateTime, venue)}
          size="small"
          variant="contained"
          className="createGigButton"
          onClick={() => { utils.createGig(getGigs, setShowDialog, dateTime, venue, city, usState, tickets, auth); }}
        >
          Create
        </Button>
        <Button
          size="small"
          className="cancelCreateButton"
          onClick={() => { setShowDialog(false); return false; }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
