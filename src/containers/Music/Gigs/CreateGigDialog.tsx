import {
  DialogActions, Button,
  Dialog, DialogTitle, DialogContent, DialogContentText, TextField, FormControl, InputLabel, Select, MenuItem,
  Autocomplete, RadioGroup, FormControlLabel, Radio, Box,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Editor } from '@tinymce/tinymce-react';
import { useContext, useState, useEffect } from 'react';
import { DataContext } from 'src/providers/Data.provider';
import { AuthContext } from 'src/providers/Auth.provider';
import adminVenuesUtils from 'src/containers/AdminVenues/admin-venues.utils';
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
  const [tickets, setTickets] = useState('');
  const [duration, setDuration] = useState(0);
  const [promoImageUrl, setPromoImageUrl] = useState('');

  // 3-path venue state
  const [venues, setVenues] = useState<any[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<any | null>(null);
  const [path, setPath] = useState<'existing' | 'new' | 'none'>('existing');
  const [inlineName, setInlineName] = useState('');
  const [inlineCity, setInlineCity] = useState('');
  const [inlineState, setInlineState] = useState('Virginia');

  useEffect(() => {
    if (showDialog && auth.token) {
      adminVenuesUtils.listVenues(auth.token)
        .then((allVenues) => {
          setVenues(allVenues.filter((v) => v.status !== 'archived'));
        })
        .catch((err) => console.error('Failed to fetch venues:', err));
    }
  }, [showDialog, auth.token]);

  const handleCreate = async () => {
    try {
      let finalVenueId = null;
      if (path === 'existing') {
        if (!selectedVenue) return;
        finalVenueId = selectedVenue._id;
      } else if (path === 'new') {
        if (!inlineName || !inlineCity || !inlineState) return;
        const newVenue = await adminVenuesUtils.createVenue(auth.token, {
          name: inlineName,
          city: inlineCity,
          usState: inlineState,
          status: 'active',
        });
        finalVenueId = newVenue._id;
      }

      const success = await utils.createGig(
        getGigs,
        setShowDialog,
        dateTime,
        venue,
        '',
        '',
        tickets,
        auth,
        duration,
        promoImageUrl,
        finalVenueId,
      );
      if (success) {
        // Reset form states
        setVenue('');
        setSelectedVenue(null);
        setInlineName('');
        setInlineCity('');
        setInlineState('Virginia');
        setPath('existing');
      }
    } catch (err) {
      console.error('Failed to create gig:', err);
    }
  };

  return (
    <Dialog
      disableEnforceFocus
      disableAutoFocus
      className="createNewGigDialog"
      open={showDialog}
      onClose={() => setShowDialog(false)}
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
            slotProps={{ textField: { className: 'dateTimeInput' } }}
          />
        </LocalizationProvider>

        <FormControl component="fieldset" sx={{ marginTop: '20px', width: '100%' }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 10px 0' }}>* Venue Option</p>
          <RadioGroup
            data-testid="venue-path-radio-group"
            row
            value={path}
            onChange={(e) => setPath(e.target.value as any)}
          >
            <FormControlLabel value="existing" control={<Radio size="small" />} label="Pick Existing Venue" />
            <FormControlLabel value="new" control={<Radio size="small" />} label="Create New Venue" />
            <FormControlLabel value="none" control={<Radio size="small" />} label="No Venue (One-off)" />
          </RadioGroup>
        </FormControl>

        {path === 'existing' && (
          <Autocomplete
            id="venue-autocomplete"
            options={venues}
            getOptionLabel={(option) => option.name || ''}
            value={selectedVenue}
            onChange={(event, newValue) => {
              setSelectedVenue(newValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="* Search Venues" variant="outlined" fullWidth />
            )}
            sx={{ marginTop: '10px', marginBottom: '20px' }}
          />
        )}

        {path === 'new' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px', marginBottom: '20px' }}>
            <TextField
              label="* Venue Name"
              type="text"
              fullWidth
              value={inlineName}
              onChange={(evt) => setInlineName(evt.target.value)}
            />
            <TextField
              label="* City"
              type="text"
              fullWidth
              value={inlineCity}
              onChange={(evt) => setInlineCity(evt.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel id="create-us-state-label">* State</InputLabel>
              <Select
                labelId="create-us-state-label"
                id="create-us-state"
                value={inlineState}
                label="* State"
                onChange={(evt) => setInlineState(evt.target.value)}
              >
                {utils.usStateOptions.map((s: string) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        )}

        {path === 'existing' && selectedVenue && (
          <Box sx={{
            padding: '10px 15px',
            backgroundColor: 'action.hover',
            borderRadius: '4px',
            borderLeft: '4px solid',
            borderColor: 'primary.main',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
          >
            <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'bold' }}>VENUE PREVIEW:</span>
            {selectedVenue.website ? (
              <a
                href={selectedVenue.website}
                target="_blank"
                rel="noopener"
                style={{ fontWeight: 'bold', textDecoration: 'underline', color: '#1976d2' }}
              >
                {selectedVenue.name}
              </a>
            ) : (
              <span style={{ fontWeight: 'bold' }}>{selectedVenue.name}</span>
            )}
            <span style={{ fontSize: '0.9rem', color: '#666' }}>
              {`(${selectedVenue.city || ''}, ${selectedVenue.usState || ''})`}
            </span>
          </Box>
        )}

        {path === 'new' && inlineName && (
          <Box sx={{
            padding: '10px 15px',
            backgroundColor: 'action.hover',
            borderRadius: '4px',
            borderLeft: '4px solid',
            borderColor: 'primary.main',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
          >
            <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'bold' }}>VENUE PREVIEW:</span>
            <span style={{ fontWeight: 'bold' }}>{inlineName}</span>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>
              {`(${inlineCity || ''}, ${inlineState || ''})`}
            </span>
          </Box>
        )}

        <p className="venueLabel">
          {path === 'none' ? '* Venue (Free-text name and details)' : 'Extra Info (Optional)'}
        </p>

        <Editor
          id="create-venue"
          value={venue}
          apiKey={process.env.TINY_KEY}
          init={{
            height: 300,
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
          onEditorChange={(text: string) => { setVenue(text); return text; }}
        />

        <TextField
          sx={{ marginTop: '20px' }}
          label="Tickets"
          type="text"
          fullWidth
          value={tickets}
          onChange={(evt) => { setTickets(evt.target.value); return evt.target.value; }}
        />
        <TextField
          sx={{ marginTop: '20px' }}
          label="Duration (hours)"
          type="number"
          fullWidth
          value={duration}
          onChange={(evt) => { setDuration(Number(evt.target.value)); return evt.target.value; }}
        />
        <TextField
          sx={{ marginTop: '20px' }}
          label="Promo image URL"
          type="text"
          fullWidth
          value={promoImageUrl}
          onChange={(evt) => { setPromoImageUrl(evt.target.value); return evt.target.value; }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          disabled={utils.checkNewDisabled(
            dateTime,
            path,
            selectedVenue?._id || null,
            venue,
            inlineName,
            inlineCity,
            inlineState,
          )}
          size="small"
          variant="contained"
          className="createGigButton"
          onClick={handleCreate}
        >
          Create
        </Button>
        <Button
          size="small"
          className="cancelCreateButton"
          onClick={() => setShowDialog(false)}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
