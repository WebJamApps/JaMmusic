import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, FormGroup, FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem, TextField,
  Autocomplete, CircularProgress,
} from '@mui/material';
import adminVenuesUtils, {
  VENUE_TYPES, BOOKING_STATUSES, RELATIONSHIP_STAGES, ORIGINALS_FITS, TRAVEL_BANDS, FIELD_HELP,
  type Ivenue, type IvenueUpdate,
} from './admin-venues.utils';

export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AS', name: 'American Samoa' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'District of Columbia' },
  { code: 'FM', name: 'Federated States of Micronesia' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'GU', name: 'Guam' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'MP', name: 'Northern Mariana Islands' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PW', name: 'Palau' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VI', name: 'Virgin Island' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
] as const;

export const COUNTRIES = [
  { code: 'US', name: 'United States (US)' },
  { code: 'CA', name: 'Canada (CA)' },
  { code: 'GB', name: 'United Kingdom (GB)' },
  { code: 'IE', name: 'Ireland (IE)' },
  { code: 'AU', name: 'Australia (AU)' },
  { code: 'NZ', name: 'New Zealand (NZ)' },
  { code: 'DE', name: 'Germany (DE)' },
  { code: 'FR', name: 'France (FR)' },
  { code: 'IT', name: 'Italy (IT)' },
  { code: 'ES', name: 'Spain (ES)' },
  { code: 'NL', name: 'Netherlands (NL)' },
  { code: 'BE', name: 'Belgium (BE)' },
  { code: 'CH', name: 'Switzerland (CH)' },
  { code: 'AT', name: 'Austria (AT)' },
  { code: 'SE', name: 'Sweden (SE)' },
  { code: 'NO', name: 'Norway (NO)' },
  { code: 'DK', name: 'Denmark (DK)' },
  { code: 'FI', name: 'Finland (FI)' },
  { code: 'JP', name: 'Japan (JP)' },
  { code: 'MX', name: 'Mexico (MX)' },
  { code: 'BR', name: 'Brazil (BR)' },
  { code: 'ZA', name: 'South Africa (ZA)' },
] as const;

// Inline consequence help shown under a field, so a manual edit can't quietly
// make the data worse (#1139 §4/§8). `field` is a FIELD_HELP key.
function Help({ field }: { field: string }) {
  return (
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', marginTop: -1.5, marginBottom: 2 }}>
      {FIELD_HELP[field]}
    </Typography>
  );
}
let googleMapsPromise: Promise<void> | null = null;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject();
  if ((window as any).google?.maps?.places) return Promise.resolve();
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    const callbackName = '__googleMapsCallback';
    (window as any)[callbackName] = () => {
      resolve();
      delete (window as any)[callbackName];
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      reject(new Error('Failed to load Google Maps script'));
      googleMapsPromise = null;
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
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

  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<any | null>(null);
  const [autocompleteService, setAutocompleteService] = useState<any | null>(null);
  const [placesService, setPlacesService] = useState<any | null>(null);

  useEffect(() => {
    if (open && process.env.GOOGLE_MAPS_API_KEY) {
      loadGoogleMapsScript(process.env.GOOGLE_MAPS_API_KEY)
        .then(() => {
          setMapsLoaded(true);
          const maps = (window as any).google?.maps;
          if (maps?.places) {
            setAutocompleteService(new maps.places.AutocompleteService());
            const dummyDiv = document.createElement('div');
            setPlacesService(new maps.places.PlacesService(dummyDiv));
          }
        })
        .catch((err) => {
          console.error('Failed to load Google Maps script:', err);
          setMapsLoaded(false);
        });
    }
  }, [open]);

  useEffect(() => {
    const maps = (window as any).google?.maps;
    if (!mapsLoaded || !autocompleteService || !form.address || !form.address.trim() || !maps) {
      setPredictions([]);
      return;
    }

    let currentToken = sessionToken;
    if (!currentToken && maps.places) {
      currentToken = new maps.places.AutocompleteSessionToken();
      setSessionToken(currentToken);
    }

    const delayDebounceFn = setTimeout(() => {
      const countryCode = form.country ? form.country.toLowerCase() : 'us';
      const options: any = {
        input: form.address || '',
        sessionToken: currentToken || undefined,
      };

      if (countryCode && countryCode.length === 2) {
        options.componentRestrictions = { country: countryCode };
      }

      setLoading(true);
      autocompleteService.getPlacePredictions(options, (results: any[], status: any) => {
        setLoading(false);
        if (status === maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results);
        } else {
          setPredictions([]);
        }
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [form.address, mapsLoaded, autocompleteService, form.country]);

  useEffect(() => {
    if (open) {
      if (venue) {
        setForm({
          name: venue.name || '',
          address: venue.address || '',
          city: venue.city || '',
          usState: venue.usState || '',
          country: venue.country || 'US',
          region: venue.region || '',
          venueType: venue.venueType || '',
          contactName: venue.contactName || '',
          email: venue.email || '',
          secondaryEmail: venue.secondaryEmail || '',
          phone: venue.phone || '',
          website: venue.website || '',
          outreachEligible: !!venue.outreachEligible,
          bookingStatus: venue.bookingStatus || 'booking',
          interested: venue.interested !== false,
          payTier: venue.payTier || '',
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
          address: '',
          city: '',
          usState: '',
          country: 'US',
          region: '',
          venueType: '',
          contactName: '',
          email: '',
          secondaryEmail: '',
          phone: '',
          website: '',
          outreachEligible: false,
          bookingStatus: 'booking',
          interested: true,
          payTier: '',
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
    if (!form.address || !form.address.trim()) { setError('Address is required'); return; }

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

    // Validate state when country is US
    const currentCountry = form.country || 'US';
    if (currentCountry === 'US' && (!form.usState || !form.usState.trim())) {
      setError('State is required for US venues');
      return;
    }

    // Validate and format website URL
    let websiteUrl = form.website ? form.website.trim() : '';
    if (websiteUrl) {
      if (!/^https?:\/\//i.test(websiteUrl)) {
        websiteUrl = `https://${websiteUrl}`;
      }
      try {
        const parsed = new URL(websiteUrl);
        if (!parsed.hostname.includes('.')) {
          throw new Error('Invalid host');
        }
      } catch {
        setError('A valid website URL is required');
        return;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const primaryEmail = form.email ? form.email.trim() : '';
    const secondaryEmail = form.secondaryEmail ? form.secondaryEmail.trim() : '';

    if (primaryEmail && !emailRegex.test(primaryEmail)) {
      setError('Primary Email is invalid');
      return;
    }
    if (secondaryEmail && !emailRegex.test(secondaryEmail)) {
      setError('Secondary Email is invalid');
      return;
    }

    const finalForm: IvenueUpdate = {
      ...form,
      name: form.name.trim(),
      address: form.address.trim(),
      email: primaryEmail,
      secondaryEmail: secondaryEmail,
      venueType: form.venueType || undefined,
      website: websiteUrl,
      country: currentCountry,
    };
    if (currentCountry === 'US') {
      finalForm.region = '';
    } else {
      finalForm.usState = '';
    }

    setSubmitting(true);
    setError('');
    try {
      if (venue) {
        // Edit mode
        await adminVenuesUtils.updateVenue(token, venue._id, {
          ...finalForm,
        });
      } else {
        // Create mode
        await adminVenuesUtils.createVenue(token, {
          ...finalForm,
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
        {!mapsLoaded ? (
          <TextField
            label="Address"
            fullWidth
            value={form.address || ''}
            onChange={(e) => set('address', e.target.value)}
            sx={{ marginBottom: 2 }}
            data-testid="edit-venue-address"
          />
        ) : (
          <Autocomplete
            freeSolo
            options={predictions}
            getOptionLabel={(option) => {
              if (typeof option === 'string') return option;
              return option.description || '';
            }}
            filterOptions={(x) => x}
            inputValue={form.address || ''}
            onInputChange={(_, newInputValue) => {
              set('address', newInputValue);
            }}
            onChange={(_, value) => {
              if (!value || typeof value === 'string') {
                return;
              }

              const prediction = value as any;
              const maps = (window as any).google?.maps;
              if (placesService && sessionToken && maps) {
                setLoading(true);
                placesService.getDetails({
                  placeId: prediction.place_id,
                  sessionToken: sessionToken,
                  fields: ['formatted_address', 'address_components', 'geometry'],
                }, (place: any, status: any) => {
                  setLoading(false);
                  if (status === maps.places.PlacesServiceStatus.OK && place) {
                    if (place.geometry && place.geometry.location) {
                      const lat = place.geometry.location.lat();
                      const lng = place.geometry.location.lng();
                      console.log(`Captured coordinates for ${prediction.description}: lat=${lat}, lng=${lng}`);
                    }

                    let streetNumber = '';
                    let route = '';
                    let city = '';
                    let state = '';
                    let country = '';

                    if (place.address_components) {
                      place.address_components.forEach((c: any) => {
                        if (c.types.includes('street_number')) {
                          streetNumber = c.long_name;
                        } else if (c.types.includes('route')) {
                          route = c.long_name;
                        } else if (c.types.includes('locality')) {
                          city = c.long_name;
                        } else if (c.types.includes('administrative_area_level_1')) {
                          state = c.short_name;
                        } else if (c.types.includes('country')) {
                          country = c.short_name;
                        }
                      });
                    }

                    const streetAddress = `${streetNumber} ${route}`.trim() || place.formatted_address || prediction.description;

                    setForm((f) => ({
                      ...f,
                      address: streetAddress,
                      city: city || f.city,
                      usState: (country === 'US' || !country) ? (state || f.usState) : '',
                      region: (country !== 'US' && country) ? (state || f.region) : '',
                      country: country || f.country || 'US',
                    }));
                  }
                  setSessionToken(null);
                });
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Address"
                fullWidth
                sx={{ marginBottom: 2 }}
                data-testid="edit-venue-address"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        )}
        <TextField label="City" fullWidth value={form.city || ''} onChange={(e) => set('city', e.target.value)}
          sx={{ marginBottom: 2 }} data-testid="edit-venue-city" />
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel id="edit-venue-country-label">Country</InputLabel>
          <Select
            labelId="edit-venue-country-label"
            label="Country"
            value={form.country || 'US'}
            onChange={(e) => {
              const newCountry = e.target.value;
              setForm((f) => ({
                ...f,
                country: newCountry,
                usState: newCountry === 'US' ? f.usState : '',
                region: newCountry === 'US' ? '' : f.region,
              }));
            }}
            data-testid="edit-venue-country"
          >
            {COUNTRIES.map((c) => (
              <MenuItem key={c.code} value={c.code}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {(!form.country || form.country === 'US') ? (
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel id="edit-venue-state-label">State</InputLabel>
            <Select
              labelId="edit-venue-state-label"
              label="State"
              value={form.usState || ''}
              onChange={(e) => set('usState', e.target.value)}
              data-testid="edit-venue-state"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {US_STATES.map((s) => (
                <MenuItem key={s.code} value={s.code}>
                  {`${s.name} (${s.code})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <TextField
            label="State/Province/Region"
            fullWidth
            value={form.region || ''}
            onChange={(e) => set('region', e.target.value)}
            sx={{ marginBottom: 2 }}
            data-testid="edit-venue-region"
          />
        )}
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
        <TextField label="Primary Email" fullWidth value={form.email || ''} onChange={(e) => set('email', e.target.value)}
          sx={{ marginBottom: 2 }} data-testid="edit-venue-email" />
        <TextField label="Secondary Email" fullWidth value={form.secondaryEmail || ''} onChange={(e) => set('secondaryEmail', e.target.value)}
          sx={{ marginBottom: 2 }} data-testid="edit-venue-secondary-email" />
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
