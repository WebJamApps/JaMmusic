import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, FormGroup, FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem, TextField,
} from '@mui/material';
import adminVenuesUtils, {
  VENUE_TYPES, BOOKING_STATUSES, RELATIONSHIP_STAGES, ORIGINALS_FITS, TRAVEL_BANDS, FIELD_HELP,
  type Ivenue, type IvenueUpdate,
} from './admin-venues.utils';

// Inline consequence help shown under a field, so a manual edit can't quietly
// make the data worse (#1139 §4/§8). `field` is a FIELD_HELP key.
function Help({ field }: { field: string }) {
  return (
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', marginTop: -1.5, marginBottom: 2 }}>
      {FIELD_HELP[field]}
    </Typography>
  );
}

interface IeditVenueDialogProps {
  open: boolean;
  venue: Ivenue | null;
  token: string;
  onClose: () => void;
  onSaved: () => void;
  existingVenues?: Ivenue[];
}

export function EditVenueDialog({
  open, venue, token, onClose, onSaved, existingVenues,
}: IeditVenueDialogProps) {
  const [form, setForm] = useState<IvenueUpdate>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (venue) {
        setForm({
          name: venue.name || '',
          city: venue.city || '',
          usState: venue.usState || '',
          venueType: venue.venueType || '',
          contactName: venue.contactName || '',
          email: venue.email || '',
          phone: venue.phone || '',
          website: venue.website || '',
          outreachEligible: !!venue.outreachEligible,
          bookingStatus: venue.bookingStatus || 'booking',
          interested: venue.interested !== false,
          payTier: venue.payTier || '',
          contactVerified: !!venue.contactVerified,
          lastVerified: venue.lastVerified ? venue.lastVerified.substring(0, 10) : '',
          notes: venue.notes || '',
          relationshipStage: venue.relationshipStage || '',
          templateOverride: venue.templateOverride || '',
          originalsFit: venue.originalsFit || '',
          travelBand: venue.travelBand || '',
          priority: venue.priority ?? undefined,
        });
      } else {
        // Safe defaults for hand-added venues
        setForm({
          name: '',
          city: '',
          usState: '',
          venueType: '',
          contactName: '',
          email: '',
          phone: '',
          website: '',
          outreachEligible: false,
          bookingStatus: 'booking',
          interested: true,
          payTier: '',
          contactVerified: false,
          lastVerified: '',
          notes: '',
          relationshipStage: '',
          templateOverride: '',
          originalsFit: '',
          travelBand: '',
          priority: undefined,
        });
      }
      setError('');
    }
  }, [venue, open]);

  const set = <K extends keyof IvenueUpdate>(key: K, value: IvenueUpdate[K]) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.name || !form.name.trim()) { setError('Name is required'); return; }

    const isCreate = !venue;
    if (existingVenues) {
      const isDuplicate = existingVenues.some(
        (v) => v.name.trim().toLowerCase() === form.name!.trim().toLowerCase() && (isCreate || v._id !== venue?._id)
      );
      if (isDuplicate) {
        const proceed = confirm(
          `A venue with the name "${form.name.trim()}" already exists. ` +
            'The existing record will be updated and un-archived instead of creating a duplicate. ' +
            'Do you want to proceed?'
        );
        if (!proceed) return;
      }
    }

    setSubmitting(true);
    setError('');
    try {
      if (venue) {
        // Edit mode
        await adminVenuesUtils.updateVenue(token, venue._id, {
          ...form,
          name: form.name.trim(),
          venueType: form.venueType || undefined,
        });
      } else {
        // Create mode
        await adminVenuesUtils.createVenue(token, {
          ...form,
          name: form.name.trim(),
          venueType: form.venueType || undefined,
        });
      }
      onSaved();
    } catch (e) {
      const err = e as { message?: string };
      setError(err.message || (venue ? 'Update failed' : 'Create failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason !== 'backdropClick') {
          onClose();
        }
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle data-testid="edit-venue-dialog-title">{venue ? `Edit Venue — ${venue.name}` : 'Add Venue'}</DialogTitle>
      <DialogContent>
        <TextField label="Name" fullWidth value={form.name || ''} onChange={(e) => set('name', e.target.value)}
          sx={{ marginTop: 1, marginBottom: 2 }} data-testid="edit-venue-name" />
        <TextField label="City" fullWidth value={form.city || ''} onChange={(e) => set('city', e.target.value)}
          sx={{ marginBottom: 2 }} data-testid="edit-venue-city" />
        <TextField label="State" fullWidth value={form.usState || ''} onChange={(e) => set('usState', e.target.value)}
          sx={{ marginBottom: 2 }} data-testid="edit-venue-state" />
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel id="edit-venue-type-label">Venue Type</InputLabel>
          <Select labelId="edit-venue-type-label" label="Venue Type" value={form.venueType || ''}
            onChange={(e) => set('venueType', e.target.value)} data-testid="edit-venue-type">
            <MenuItem value="">None</MenuItem>
            {VENUE_TYPES.map((t) => (<MenuItem key={t} value={t}>{t}</MenuItem>))}
          </Select>
        </FormControl>
        <Help field="venueType" />
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel id="edit-venue-booking-label">Booking Status</InputLabel>
          <Select labelId="edit-venue-booking-label" label="Booking Status" value={form.bookingStatus || 'booking'}
            onChange={(e) => set('bookingStatus', e.target.value)} data-testid="edit-venue-booking">
            {BOOKING_STATUSES.map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
          </Select>
        </FormControl>
        <Help field="bookingStatus" />
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel id="edit-venue-stage-label">Relationship Stage</InputLabel>
          <Select labelId="edit-venue-stage-label" label="Relationship Stage" value={form.relationshipStage || ''}
            onChange={(e) => set('relationshipStage', e.target.value)} data-testid="edit-venue-stage">
            <MenuItem value="">Auto (derive from history)</MenuItem>
            {RELATIONSHIP_STAGES.map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
          </Select>
        </FormControl>
        <Help field="relationshipStage" />
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel id="edit-venue-override-label">Template Override</InputLabel>
          <Select labelId="edit-venue-override-label" label="Template Override" value={form.templateOverride || ''}
            onChange={(e) => set('templateOverride', e.target.value)} data-testid="edit-venue-override">
            <MenuItem value="">None (use venue type)</MenuItem>
            {VENUE_TYPES.map((t) => (<MenuItem key={t} value={t}>{t}</MenuItem>))}
          </Select>
        </FormControl>
        <Help field="templateOverride" />
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel id="edit-venue-originals-label">Originals Fit</InputLabel>
          <Select labelId="edit-venue-originals-label" label="Originals Fit" value={form.originalsFit || ''}
            onChange={(e) => set('originalsFit', e.target.value)} data-testid="edit-venue-originals">
            <MenuItem value="">Unset</MenuItem>
            {ORIGINALS_FITS.map((o) => (<MenuItem key={o} value={o}>{o}</MenuItem>))}
          </Select>
        </FormControl>
        <Help field="originalsFit" />
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel id="edit-venue-travel-label">Travel Band</InputLabel>
          <Select labelId="edit-venue-travel-label" label="Travel Band" value={form.travelBand || ''}
            onChange={(e) => set('travelBand', e.target.value)} data-testid="edit-venue-travel">
            <MenuItem value="">Unset</MenuItem>
            {TRAVEL_BANDS.map((t) => (<MenuItem key={t} value={t}>{t}</MenuItem>))}
          </Select>
        </FormControl>
        <Help field="travelBand" />
        <TextField label="Contact Name" fullWidth value={form.contactName || ''} onChange={(e) => set('contactName', e.target.value)}
          sx={{ marginBottom: 2 }} data-testid="edit-venue-contact" />
        <TextField label="Email" fullWidth value={form.email || ''} onChange={(e) => set('email', e.target.value)}
          sx={{ marginBottom: 2 }} data-testid="edit-venue-email" />
        <TextField label="Phone" fullWidth value={form.phone || ''} onChange={(e) => set('phone', e.target.value)}
          sx={{ marginBottom: 2 }} data-testid="edit-venue-phone" />
        <TextField label="Website" fullWidth value={form.website || ''} onChange={(e) => set('website', e.target.value)}
          sx={{ marginBottom: 2 }} data-testid="edit-venue-website" />
        <TextField label="Pay Tier" fullWidth value={form.payTier || ''} onChange={(e) => set('payTier', e.target.value)}
          sx={{ marginBottom: 1 }} data-testid="edit-venue-pay" />
        <Help field="payTier" />
        <TextField
          label="Priority (0–5)"
          type="number"
          fullWidth
          slotProps={{ htmlInput: { min: 0, max: 5 } }}
          value={form.priority ?? ''}
          onChange={(e) => set('priority', e.target.value === '' ? undefined : Number(e.target.value))}
          sx={{ marginBottom: 1 }}
          data-testid="edit-venue-priority"
        />
        <Help field="priority" />
        <FormGroup>
          <FormControlLabel
            control={(
              <Checkbox checked={!!form.outreachEligible} onChange={(e) => set('outreachEligible', e.target.checked)}
                aria-label="outreach eligible" data-testid="edit-venue-eligible" />
            )}
            label="Outreach eligible (vetted — can be pitched)" />
          <Help field="outreachEligible" />

          <FormControlLabel
            control={(
              <Checkbox
                checked={form.interested !== false}
                onChange={(e) => set('interested', e.target.checked)}
                aria-label="interested"
                data-testid="edit-venue-interested" />
            )}
            label="Interested (worth pursuing)" />
          <Help field="interested" />
          <FormControlLabel
            control={(
              <Checkbox checked={!!form.contactVerified} onChange={(e) => set('contactVerified', e.target.checked)}
                aria-label="contact verified" data-testid="edit-venue-contactverified" />
            )}
            label="Contact verified" />
          <Help field="contactVerified" />
        </FormGroup>
        <TextField
          label="Last Verified"
          type="date"
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
          value={form.lastVerified || ''}
          onChange={(e) => set('lastVerified', e.target.value)}
          sx={{ marginBottom: 1, marginTop: 2 }}
          data-testid="edit-venue-lastverified"
        />
        <Help field="lastVerified" />
        <TextField label="Notes" fullWidth multiline rows={6} value={form.notes || ''} onChange={(e) => set('notes', e.target.value)}
          sx={{ marginTop: 2 }} data-testid="edit-venue-notes" />
        {error && <Typography color="error" sx={{ marginTop: 1 }} data-testid="edit-venue-error">{error}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} data-testid="edit-venue-cancel">Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={submitting} data-testid="edit-venue-save">
          {submitting ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
