import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField,
  FormControl, Autocomplete, RadioGroup, FormControlLabel, Radio, Box,
} from '@mui/material';
import type { Igig } from 'src/providers/Data.provider';
import { defaultGig } from 'src/providers/fetchGigs';
import { Editor } from '@tinymce/tinymce-react';
import type { Iauth } from 'src/providers/Auth.provider';
import { useContext, useState, useEffect, useRef } from 'react';
import adminVenuesUtils, { type Ivenue } from 'src/containers/AdminVenues/admin-venues.utils';
import utils from './gigs.utils';
import { GigVenueFields } from './GigVenueFields';
import { useGigVenue } from './useGigVenue';

interface IeditTextProps {
  objKey: 'tickets',
  editGig: typeof defaultGig,
  setEditChanged: (arg0: boolean) => void,
  setEditGig: (arg0: typeof defaultGig) => void,
  required: boolean, disabled?: boolean
}
export const EditText = (props: IeditTextProps) => {
  const {
    objKey, editGig, setEditChanged, setEditGig, required, disabled,
  } = props;
  let label = required ? '* ' : '';
  label = label + objKey.charAt(0).toUpperCase() + objKey.slice(1);
  return (
    <TextField
      disabled={disabled}
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

interface IeditGigDialogProps {
  editGig: Igig, setEditGig: (arg0: Igig) => void, setShowDialog: (arg0: boolean) => void,
  setEditChanged: (arg0: boolean) => void, editChanged: boolean, getGigs: () => void, auth: Iauth,
  onSaveMessage?: (message: string) => void
}
export function EditGigDialog(props: IeditGigDialogProps) {
  const {
    editGig, setEditGig, setShowDialog, setEditChanged, editChanged, getGigs, auth, onSaveMessage,
  } = props;

  // 3-path venue state
  const [venues, setVenues] = useState<Ivenue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Ivenue | null>(null);
  const [path, setPath] = useState<'existing' | 'new' | 'none'>('none');
  const venueForm = useGigVenue(editGig._id, auth.token);
  const { fields } = venueForm;
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  useEffect(() => { setSaveError(''); }, [editGig._id]);

  useEffect(() => {
    let cancelled = false;
    if (editGig._id && auth.token) {
      const initialVenue = editGig.venueId;
      const initialId = typeof initialVenue === 'object' ? initialVenue?._id : initialVenue;
      setPath(initialId ? 'existing' : 'none');
      setSelectedVenue(null);
      adminVenuesUtils.listVenues(auth.token).then((allVenues) => {
        if (cancelled) return;
        const activeVenues = allVenues.filter((v) => v.status !== 'archived');
        setVenues(activeVenues);
        if (initialId) setSelectedVenue((selected) => selected || activeVenues.find((v) => v._id === initialId) || null);
      }).catch((err) => console.error('Failed to fetch venues:', err));
    }
    return () => { cancelled = true; };
  }, [editGig._id, auth.token]);

  const handleUpdate = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError('');
    let venueMessage = venueForm.outcomeMessage;
    try {
      let finalVenueId = editGig.venueId;
      if (path === 'existing') {
        if (!selectedVenue) return;
        finalVenueId = selectedVenue._id;
      } else if (path === 'new') {
        const savedVenue = await venueForm.save();
        finalVenueId = savedVenue.id;
        venueMessage = savedVenue.message;
        onSaveMessage?.(venueMessage);
      } else {
        finalVenueId = undefined;
      }

      const updatedGig = {
        ...editGig,
        venueId: finalVenueId,
        ...(finalVenueId ? { city: '', usState: '' } : {}),
      };

      const result = await utils.updateGig(getGigs, setEditGig, setEditChanged, updatedGig, auth.token, setSaveError);
      if (result === 'success' || result === 'unconfirmed') {
        onSaveMessage?.([
          venueMessage, result === 'success' ? 'Gig updated.' : "Couldn't confirm gig save — list refreshed.",
        ].filter(Boolean).join('. '));
        setShowDialog(false);
      } else {
        setSaveError((message) => message || 'Unable to update gig. Please retry.');
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Unable to update gig.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  if (!editGig._id) return null;

  return (
    <Dialog
      disableEnforceFocus
      disableAutoFocus
      className="editGigDialog"
      open={!!editGig._id}
      onClose={() => { if (!saving) setEditGig(defaultGig); }}
    >
      <DialogTitle>Edit Gig</DialogTitle>
      <DialogContent sx={{ padding: '10px 10px' }}>
        {saveError && <div role="alert">{saveError}</div>}
        {venueForm.outcomeMessage && <div role="status">{venueForm.outcomeMessage}</div>}
        <DialogContentText sx={{ marginBottom: '30px' }}>Enter all *required fields</DialogContentText>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            disabled={saving}
            className="editDateTime"
            label="* Date and Time"
            value={editGig.datetime ? new Date(editGig.datetime) : null}
            onChange={(newValue: Date | null) => {
              setEditChanged(true);
              setEditGig({ ...editGig, datetime: newValue }); return newValue;
            }}
            slotProps={{ textField: { className: 'dateTimeInput' } }}
          />
        </LocalizationProvider>

        <FormControl component="fieldset" sx={{ marginTop: '20px', width: '100%' }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 10px 0' }}>* Venue Option</p>
          <RadioGroup
            data-testid="venue-path-radio-group"
            row
            value={path}
            onChange={(e) => {
              const newPath = e.target.value as 'existing' | 'new' | 'none';
              setPath(newPath);
              setEditChanged(true);
              if (newPath === 'none') {
                setSelectedVenue(null);
                setEditGig({ ...editGig, venueId: undefined });
              }
            }}
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
              setEditChanged(true);
              setEditGig({ ...editGig, venueId: newValue || undefined });
            }}
            renderInput={(params) => (
              <TextField {...params} disabled={saving} label="* Search Venues" variant="outlined" fullWidth />
            )}
            sx={{ marginTop: '10px', marginBottom: '20px' }}
          />
        )}

        {path === 'new' && <GigVenueFields form={venueForm} disabled={saving} onChange={() => setEditChanged(true)} />}

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
          id="edit-venue"
          value={editGig.venue}
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
          onEditorChange={(text: string) => {
            if (text !== `<p>${editGig.venue}</p>`) {
              setEditChanged(true);
              setEditGig({ ...editGig, venue: text });
            }
          }}
        />

        <EditText disabled={saving} objKey="tickets" editGig={editGig} setEditChanged={setEditChanged} setEditGig={setEditGig} required={false} />
        <TextField
          disabled={saving}
          label="Duration (hours)"
          type="number"
          fullWidth
          sx={{ marginTop: '20px' }}
          value={editGig.duration ?? 0}
          onChange={(evt) => { setEditChanged(true); setEditGig({ ...editGig, duration: Number(evt.target.value) }); }}
        />
        <TextField
          disabled={saving}
          label="Promo image URL"
          type="text"
          fullWidth
          sx={{ marginTop: '20px' }}
          value={editGig.promoImageUrl ?? ''}
          onChange={(evt) => { setEditChanged(true); setEditGig({ ...editGig, promoImageUrl: evt.target.value }); }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          disabled={saving || (path === 'new' && !venueForm.ready) || utils.checkUpdateDisabled(
            editGig,
            editChanged,
            path,
            selectedVenue?._id || null,
            editGig.venue || '',
            fields.name,
            fields.city,
            fields.usState,
            fields.address,
            fields.zipCode,
            fields.website,
          )}
          size="small"
          variant="contained"
          className="updateGigButton"
          onClick={handleUpdate}
        >
          Update
        </Button>
        <Button
          size="small"
          disabled={saving}
          className="deleteGigButton"
          sx={{ color: 'red' }}
          onClick={async () => {
            setEditChanged(false);
            const result = await utils.deleteGig(editGig._id || '', getGigs, setEditGig, setEditChanged, auth.token);
            if (result === 'success' || result === 'unconfirmed') {
              setShowDialog(false);
            }
          }}
        >
          Delete
        </Button>
        <Button
          size="small"
          disabled={saving}
          className="cancelEditGigButton"
          onClick={() => {
            setEditChanged(false);
            setEditGig(defaultGig);
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
