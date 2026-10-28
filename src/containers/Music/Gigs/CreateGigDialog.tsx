import {
  DialogActions, Button,
  Dialog, DialogTitle, DialogContent, DialogContentText, TextField, FormControl,
  Autocomplete, RadioGroup, FormControlLabel, Radio, Box,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Editor } from '@tinymce/tinymce-react';
import { useContext, useState, useEffect, useRef } from 'react';
import { DataContext } from 'src/providers/Data.provider';
import { AuthContext } from 'src/providers/Auth.provider';
import adminVenuesUtils, { type Ivenue } from 'src/containers/AdminVenues/admin-venues.utils';
import utils from './gigs.utils';
import { GigVenueFields } from './GigVenueFields';
import { useGigVenue } from './useGigVenue';

interface IcreateGigDialogProps {
  showDialog: boolean, setShowDialog: (arg0: boolean) => void, onSaveMessage?: (message: string) => void,
}
export function CreateGigDialog({
  showDialog, setShowDialog, onSaveMessage,
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
  const [venues, setVenues] = useState<Ivenue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Ivenue | null>(null);
  const [path, setPath] = useState<'existing' | 'new' | 'none'>('existing');
  const venueForm = useGigVenue(showDialog, auth.token);
  const { fields } = venueForm;
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  useEffect(() => { setSaveError(''); }, [showDialog]);

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
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError('');
    let venueMessage = venueForm.outcomeMessage;
    try {
      let finalVenueId = null;
      if (path === 'existing') {
        if (!selectedVenue) return;
        finalVenueId = selectedVenue._id;
      } else if (path === 'new') {
        const savedVenue = await venueForm.save();
        finalVenueId = savedVenue.id;
        venueMessage = savedVenue.message;
        onSaveMessage?.(venueMessage);
      }

      const result = await utils.createGig(
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
        setSaveError,
      );
      if (result === 'success' || result === 'unconfirmed') {
        onSaveMessage?.([
          venueMessage, result === 'success' ? 'Gig created.' : "Couldn't confirm gig save — list refreshed.",
        ].filter(Boolean).join('. '));
        // Reset form states
        setVenue('');
        setSelectedVenue(null);
        setPath('existing');
      } else {
        setSaveError((message) => message || 'Unable to create gig. Please retry.');
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Unable to create gig.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <Dialog
      disableEnforceFocus
      disableAutoFocus
      className="createNewGigDialog"
      open={showDialog}
      onClose={() => { if (!saving) setShowDialog(false); }}
    >
      <DialogTitle>Create New Gig</DialogTitle>
      <DialogContent sx={{ padding: '10px 10px' }}>
        {saveError && <div role="alert">{saveError}</div>}
        {venueForm.outcomeMessage && <div role="status">{venueForm.outcomeMessage}</div>}
        <DialogContentText sx={{ marginBottom: '30px' }}>
          Enter all *required fields to create a new gig.
        </DialogContentText>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            disabled={saving}
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
            onChange={(e) => setPath(e.target.value as 'existing' | 'new' | 'none')}
          >
            <FormControlLabel value="existing" control={<Radio size="small" disabled={saving} />} label="Pick Existing Venue" />
            <FormControlLabel value="new" control={<Radio size="small" disabled={saving} />} label="Create New Venue" />
            <FormControlLabel value="none" control={<Radio size="small" disabled={saving} />} label="No Venue (One-off)" />
          </RadioGroup>
        </FormControl>

        {path === 'existing' && (
          <Autocomplete
            disabled={saving}
            id="venue-autocomplete"
            options={venues}
            getOptionLabel={(option) => option.name || ''}
            value={selectedVenue}
            onChange={(event, newValue) => {
              setSelectedVenue(newValue);
            }}
            renderInput={(params) => (
              <TextField {...params} disabled={saving} label="* Search Venues" variant="outlined" fullWidth />
            )}
            sx={{ marginTop: '10px', marginBottom: '20px' }}
          />
        )}

        {path === 'new' && <GigVenueFields form={venueForm} disabled={saving} open={showDialog} token={auth.token} />}

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
            {selectedVenue.address && selectedVenue.address.trim() ? (
              <a
                href={adminVenuesUtils.getGoogleMapsUrl(selectedVenue.address, selectedVenue.city, selectedVenue.usState)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${selectedVenue.name || 'venue'} in Google Maps`}
                style={{ fontSize: '0.9rem', color: '#1976d2', textDecoration: 'underline' }}
              >
                {`(${[selectedVenue.address, selectedVenue.city, selectedVenue.usState].filter(Boolean).join(', ')})`}
              </a>
            ) : (
              <span style={{ fontSize: '0.9rem', color: '#666' }}>
                {`(${[selectedVenue.city, selectedVenue.usState].filter(Boolean).join(', ')})`}
              </span>
            )}
          </Box>
        )}

        {path === 'new' && fields.name && (
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
            <span style={{ fontWeight: 'bold' }}>{fields.name}</span>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>
              {`(${[fields.city, fields.usState].filter(Boolean).join(', ')})`}
            </span>
          </Box>
        )}

        <p className="venueLabel">
          {path === 'none' ? '* Venue (Free-text name and details)' : 'Extra Info (Optional)'}
        </p>

        <Editor
          disabled={saving}
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
          disabled={saving}
          sx={{ marginTop: '20px' }}
          label="Tickets"
          type="text"
          fullWidth
          value={tickets}
          onChange={(evt) => { setTickets(evt.target.value); return evt.target.value; }}
        />
        <TextField
          disabled={saving}
          sx={{ marginTop: '20px' }}
          label="Duration (hours)"
          type="number"
          fullWidth
          value={duration}
          onChange={(evt) => { setDuration(Number(evt.target.value)); return evt.target.value; }}
        />
        <TextField
          disabled={saving}
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
          disabled={saving || (path === 'new' && !venueForm.ready) || utils.checkNewDisabled(
            dateTime,
            path,
            selectedVenue?._id || null,
            venue,
            fields.name,
            fields.city,
            fields.usState,
            fields.address,
            fields.zipCode,
            fields.website,
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
          disabled={saving}
          className="cancelCreateButton"
          onClick={() => setShowDialog(false)}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
