import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, FormGroup, FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem, TextField,
} from '@mui/material';
import adminVenuesUtils, {
  VENUE_TYPES, BOOKING_STATUSES, RELATIONSHIP_STAGES, type Ivenue, type IvenueUpdate,
} from './admin-venues.utils';

interface IeditVenueDialogProps {
  open: boolean;
  venue: Ivenue | null;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}

export function EditVenueDialog({
  open, venue, token, onClose, onSaved,
}: IeditVenueDialogProps) {
  const [form, setForm] = useState<IvenueUpdate>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
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
        inScope: venue.inScope !== false,
        bookingStatus: venue.bookingStatus || 'booking',
        interested: venue.interested !== false,
        payTier: venue.payTier || '',
        contactVerified: !!venue.contactVerified,
        notes: venue.notes || '',
        relationshipStage: venue.relationshipStage || '',
        templateOverride: venue.templateOverride || '',
      });
    }
    setError('');
  }, [venue]);

  const set = <K extends keyof IvenueUpdate>(key: K, value: IvenueUpdate[K]) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!venue) return;
    if (!form.name || !form.name.trim()) { setError('Name is required'); return; }
    setSubmitting(true);
    setError('');
    try {
      await adminVenuesUtils.updateVenue(token, venue._id, {
        ...form,
        name: form.name.trim(),
        venueType: form.venueType || undefined,
      });
      onSaved();
    } catch (e) {
      const err = e as { message?: string };
      setError(err.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Venue{venue ? ` — ${venue.name}` : ''}</DialogTitle>
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
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel id="edit-venue-booking-label">Booking Status</InputLabel>
          <Select labelId="edit-venue-booking-label" label="Booking Status" value={form.bookingStatus || 'booking'}
            onChange={(e) => set('bookingStatus', e.target.value)} data-testid="edit-venue-booking">
            {BOOKING_STATUSES.map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel id="edit-venue-stage-label">Relationship Stage</InputLabel>
          <Select labelId="edit-venue-stage-label" label="Relationship Stage" value={form.relationshipStage || ''}
            onChange={(e) => set('relationshipStage', e.target.value)} data-testid="edit-venue-stage">
            <MenuItem value="">Auto (derive from history)</MenuItem>
            {RELATIONSHIP_STAGES.map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel id="edit-venue-override-label">Template Override</InputLabel>
          <Select labelId="edit-venue-override-label" label="Template Override" value={form.templateOverride || ''}
            onChange={(e) => set('templateOverride', e.target.value)} data-testid="edit-venue-override">
            <MenuItem value="">None (use venue type)</MenuItem>
            {VENUE_TYPES.map((t) => (<MenuItem key={t} value={t}>{t}</MenuItem>))}
          </Select>
        </FormControl>
        <TextField label="Contact Name" fullWidth value={form.contactName || ''} onChange={(e) => set('contactName', e.target.value)}
          sx={{ marginBottom: 2 }} data-testid="edit-venue-contact" />
        <TextField label="Email" fullWidth value={form.email || ''} onChange={(e) => set('email', e.target.value)}
          sx={{ marginBottom: 2 }} data-testid="edit-venue-email" />
        <TextField label="Phone" fullWidth value={form.phone || ''} onChange={(e) => set('phone', e.target.value)}
          sx={{ marginBottom: 2 }} data-testid="edit-venue-phone" />
        <TextField label="Website" fullWidth value={form.website || ''} onChange={(e) => set('website', e.target.value)}
          sx={{ marginBottom: 2 }} data-testid="edit-venue-website" />
        <TextField label="Pay Tier" fullWidth value={form.payTier || ''} onChange={(e) => set('payTier', e.target.value)}
          sx={{ marginBottom: 2 }} data-testid="edit-venue-pay" />
        <FormGroup>
          <FormControlLabel
            control={(
              <Checkbox checked={!!form.outreachEligible} onChange={(e) => set('outreachEligible', e.target.checked)}
                aria-label="outreach eligible" data-testid="edit-venue-eligible" />
            )}
            label="Outreach eligible (vetted — can be pitched)" />
          <FormControlLabel
            control={(
              <Checkbox checked={form.inScope !== false} onChange={(e) => set('inScope', e.target.checked)}
                aria-label="in scope" data-testid="edit-venue-inscope" />
            )}
            label="In scope (a gig-booking venue)" />
          <FormControlLabel
            control={(
              <Checkbox
                checked={form.interested !== false}
                onChange={(e) => set('interested', e.target.checked)}
                aria-label="interested"
                data-testid="edit-venue-interested" />
            )}
            label="Interested (worth pursuing)" />
          <FormControlLabel
            control={(
              <Checkbox checked={!!form.contactVerified} onChange={(e) => set('contactVerified', e.target.checked)}
                aria-label="contact verified" data-testid="edit-venue-contactverified" />
            )}
            label="Contact verified" />
        </FormGroup>
        <TextField label="Notes" fullWidth multiline rows={2} value={form.notes || ''} onChange={(e) => set('notes', e.target.value)}
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
