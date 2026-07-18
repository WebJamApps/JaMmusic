import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField,
  FormControl, InputLabel, Select, MenuItem, Autocomplete, RadioGroup, FormControlLabel, Radio, Box,
} from '@mui/material';
import type { Igig } from 'src/providers/Data.provider';
import { defaultGig } from 'src/providers/fetchGigs';
import { Editor } from '@tinymce/tinymce-react';
import type { Iauth } from 'src/providers/Auth.provider';
import { useContext, useState, useEffect } from 'react';
import adminVenuesUtils from 'src/containers/AdminVenues/admin-venues.utils';
import utils from './gigs.utils';

interface IeditTextProps {
  objKey: 'tickets',
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

interface IeditGigDialogProps {
  editGig: Igig, setEditGig: (arg0: Igig) => void, setShowDialog: (arg0: boolean) => void,
  setEditChanged: (arg0: boolean) => void, editChanged: boolean, getGigs: () => void, auth: Iauth
}
export function EditGigDialog(props: IeditGigDialogProps) {
  const {
    editGig, setEditGig, setShowDialog, setEditChanged, editChanged, getGigs, auth,
  } = props;

  // 3-path venue state
  const [venues, setVenues] = useState<any[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<any | null>(null);
  const [path, setPath] = useState<'existing' | 'new' | 'none'>('none');
  const [inlineName, setInlineName] = useState('');
  const [inlineCity, setInlineCity] = useState('');
  const [inlineState, setInlineState] = useState('Virginia');

  useEffect(() => {
    if (editGig._id && auth.token) {
      adminVenuesUtils.listVenues(auth.token)
        .then((allVenues) => {
          const activeVenues = allVenues.filter((v) => v.status !== 'archived');
          setVenues(activeVenues);

          // Find initial path and selected venue
          const initialVenueIdStr = typeof editGig.venueId === 'object' ? editGig.venueId?._id : editGig.venueId;
          if (initialVenueIdStr) {
            setPath('existing');
            const match = activeVenues.find((v) => v._id === initialVenueIdStr);
            if (match) setSelectedVenue(match);
          } else {
            setPath('none');
            setSelectedVenue(null);
          }
        })
        .catch((err) => console.error('Failed to fetch venues:', err));
    }
  }, [editGig._id, auth.token]);

  const handleUpdate = async () => {
    try {
      let finalVenueId = editGig.venueId;
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
      } else {
        finalVenueId = undefined;
      }

      const updatedGig = {
        ...editGig,
        venueId: finalVenueId,
        city: '',
        usState: '',
      };

      await utils.updateGig(getGigs, setEditGig, setEditChanged, updatedGig, auth.token);
      setShowDialog(false);
    } catch (err) {
      console.error('Failed to update gig:', err);
    }
  };

  if (!editGig._id) return null;

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
        <DialogContentText sx={{ marginBottom: '30px' }}>Enter all *required fields</DialogContentText>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            className="editDateTime"
            label="* Date and Time"
            value={editGig.datetime}
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
              const newPath = e.target.value as any;
              setPath(newPath);
              setEditChanged(true);
              if (newPath === 'none') {
                setSelectedVenue(null);
                setEditGig({ ...editGig, venueId: undefined });
              }
            }}
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
              setEditChanged(true);
              setEditGig({ ...editGig, venueId: newValue || undefined });
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
              onChange={(evt) => {
                setInlineName(evt.target.value);
                setEditChanged(true);
              }}
            />
            <TextField
              label="* City"
              type="text"
              fullWidth
              value={inlineCity}
              onChange={(evt) => {
                setInlineCity(evt.target.value);
                setEditChanged(true);
              }}
            />
            <FormControl fullWidth>
              <InputLabel id="create-us-state-label">* State</InputLabel>
              <Select
                labelId="create-us-state-label"
                id="create-us-state"
                value={inlineState}
                label="* State"
                onChange={(evt) => {
                  setInlineState(evt.target.value);
                  setEditChanged(true);
                }}
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

        <EditText objKey="tickets" editGig={editGig} setEditChanged={setEditChanged} setEditGig={setEditGig} required={false} />
        <TextField
          label="Duration (hours)"
          type="number"
          fullWidth
          sx={{ marginTop: '20px' }}
          value={editGig.duration ?? 0}
          onChange={(evt) => { setEditChanged(true); setEditGig({ ...editGig, duration: Number(evt.target.value) }); }}
        />
        <TextField
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
          disabled={utils.checkUpdateDisabled(
            editGig,
            editChanged,
            path,
            selectedVenue?._id || null,
            editGig.venue || '',
            inlineName,
            inlineCity,
            inlineState,
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
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
