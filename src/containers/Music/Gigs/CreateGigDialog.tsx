import {
  DialogActions, Button,
  Dialog, DialogTitle, DialogContent, DialogContentText, TextField, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Editor } from '@tinymce/tinymce-react';
import { useContext, useState } from 'react';
import { DataContext } from 'src/providers/Data.provider';
import utils from './gigs.utils';

// eslint-disable-next-line max-len
export const usStateOptions = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Federated States of Micronesia', 'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Island', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

interface IcreateGigDialogProps {
  showDialog: boolean, setShowDialog: (arg0: boolean) => void,
}
export function CreateGigDialog({
  showDialog, setShowDialog,
}: IcreateGigDialogProps) {
  const { getGigs } = useContext(DataContext);
  const now = new Date() as Date | null;
  const [dateTime, setDateTime] = useState(now);
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [usState, setUSstate] = useState('Virginia');
  const [tickets, setTickets] = useState('');
  return (
    <Dialog
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
        <p style={{ fontSize: '9pt', marginBottom: '0px' }}>* Venue</p>
        <Editor
          id="create-venue"
          value={venue}
          apiKey={process.env.TINY_KEY}
          init={{
            height: 500,
            menubar: 'insert tools',
            menu: { format: { title: 'Format', items: 'forecolor backcolor' } },
            plugins: [
              'advlist autolink lists link image charmap print preview anchor',
              'searchreplace visualblocks code fullscreen',
              'insertdatetime media table paste code help wordcount',
            ],
            toolbar:
              'undo redo | formatselect | bold italic backcolor forecolor |'
              + 'alignleft aligncenter alignright alignjustify |'
              + 'bullist numlist outdent indent | removeformat | help',
          }}
          onEditorChange={(text) => { setVenue(text); return text; }}
        />
        <TextField
          autoFocus
          margin="normal"
          id="create-city"
          label="* City"
          type="text"
          fullWidth
          variant="standard"
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
            {usStateOptions.map((s: string) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField
          autoFocus
          margin="dense"
          id="create-tickets"
          label="Tickets"
          type="text"
          fullWidth
          variant="standard"
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
          onClick={() => { utils.createGig(getGigs, setShowDialog, dateTime, venue, city, usState, tickets); return true; }}
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
