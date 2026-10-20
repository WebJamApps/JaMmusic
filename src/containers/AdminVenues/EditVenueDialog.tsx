import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, FormGroup, FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem, TextField,
  Autocomplete, CircularProgress, Box, Chip,
} from '@mui/material';
import adminVenuesUtils, {
  VENUE_TYPES, BOOKING_STATUSES, AUDIENCE_ATTENTIONS, FIELD_HELP,
  type Ivenue, type IvenueUpdate,
} from './admin-venues.utils';

import * as venueShared from './venue-shared.utils';

export { US_STATES, COUNTRIES } from './venue-shared.utils';

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
  onSaved: (message: string) => void;
  existingVenues?: Ivenue[];
}

export function EditVenueDialog({
  open, venue, token, onClose, onSaved, existingVenues,
}: IeditVenueDialogProps) {
  const [form, setForm] = useState<IvenueUpdate>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [familyNearbyTouched, setFamilyNearbyTouched] = useState(false);
  const [familyNearbyReset, setFamilyNearbyReset] = useState(false);

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

  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (open) {
      setFamilyNearbyTouched(false);
      setFamilyNearbyReset(false);
      setNotice('');
      if (venue) {
        setForm({
          name: venue.name || '',
          address: venue.address || '',
          city: venue.city || '',
          usState: venue.usState || '',
          zipCode: venue.zipCode || '',
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
          payAmount: venue.payAmount ?? undefined,
          audienceAttention: venue.audienceAttention || '',
          personalFavorite: !!venue.personalFavorite,
          familyNearby: !!venue.familyNearby,
          lastVerified: venue.lastVerified ? venue.lastVerified.substring(0, 10) : '',
          notes: venue.notes || '',
          templateOverride: venue.templateOverride || '',
          gigInterval: venue.gigInterval ?? 0,
          resumeBooking: venue.resumeBooking ? venue.resumeBooking.substring(0, 10) : '',
        });
      } else {
        // Safe defaults for hand-added venues
        setForm({
          name: '',
          address: '',
          city: '',
          usState: '',
          zipCode: '',
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
          payAmount: undefined,
          audienceAttention: '',
          personalFavorite: false,
          familyNearby: false,
          lastVerified: '',
          notes: '',
          templateOverride: '',
          gigInterval: 0,
          resumeBooking: '',
        });
      }
      setError('');
    }
  }, [venue, open]);

  const set = <K extends keyof IvenueUpdate>(key: K, value: IvenueUpdate[K]) => setForm((f) => ({ ...f, [key]: value }));

  const [warningVenues, setWarningVenues] = useState<Ivenue[]>([]);
  const [inventoryReady, setInventoryReady] = useState(false);
  const [inventoryError, setInventoryError] = useState('');
  const [inventoryAttempt, setInventoryAttempt] = useState(0);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setInventoryReady(false);
    setInventoryError('');
    const load = async () => {
      try {
        const inventory = existingVenues ?? await adminVenuesUtils.fetchWarningVenues(token);
        if (!cancelled) {
          setWarningVenues(inventory);
          setInventoryReady(true);
        }
      } catch (e) {
        if (!cancelled) setInventoryError((e as Error).message || 'Failed to check existing venues');
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [open, token, existingVenues, inventoryAttempt]);

  const handleSave = async () => {
    if (!inventoryReady || submitting) return;
    const validation = venueShared.validateVenueFields({ ...form }, {
      mode: venue ? 'edit' : 'create', originalVenue: venue,
    });
    if (!validation.valid) {
      setError(validation.error || 'Check the venue fields');
      return;
    }
    const currentCountry = form.country || 'US';

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

    const warning = venueShared.getExistingVenueWarning({
      name: form.name, city: form.city, address: form.address,
      inventory: warningVenues, mode: venue ? 'edit' : 'create', selectedVenueId: venue?._id,
    });
    if (warning.hasWarning && !confirm(`${warning.message}\n\nDo you want to proceed?`)) return;

    const finalForm: IvenueUpdate = {
      ...form,
      name: form.name!.trim(),
      city: (form.city || '').trim(),
      address: (form.address || '').trim(),
      zipCode: (form.zipCode || '').trim() || undefined,
      email: primaryEmail,
      secondaryEmail: secondaryEmail,
      venueType: form.venueType || undefined,
      templateOverride: form.templateOverride || undefined,
      audienceAttention: form.audienceAttention || undefined,
      website: validation.formattedWebsite,
      country: currentCountry,
      gigInterval: typeof form.gigInterval === 'number' ? form.gigInterval : 0,
      resumeBooking: form.resumeBooking || null,
    };
    delete finalForm.bookingStatus;
    if (familyNearbyReset) {
      if (venue) {
        finalForm.familyNearby = null;
      } else {
        delete finalForm.familyNearby;
      }
    } else if (familyNearbyTouched) {
      finalForm.familyNearby = !!form.familyNearby;
    } else {
      delete finalForm.familyNearby;
    }
    if (!finalForm.templateOverride) {
      delete finalForm.templateOverride;
    }
    if (!finalForm.audienceAttention) {
      delete finalForm.audienceAttention;
    }
    if (!finalForm.venueType) {
      delete finalForm.venueType;
    }
    const finalFormRecord = finalForm as Record<string, unknown>;
    delete finalFormRecord.relationshipStage;
    delete finalFormRecord.payTier;
    delete finalFormRecord.originalsFit;
    delete finalFormRecord.travelBand;
    if (currentCountry === 'US') {
      finalForm.region = '';
    } else {
      finalForm.usState = '';
    }

    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      let savedVenue: Ivenue;
      let outcome: 'created' | 'updated' = 'updated';
      if (venue) {
        // Edit mode
        savedVenue = await adminVenuesUtils.updateVenue(token, venue._id, {
          ...finalForm,
        });
      } else {
        // Create mode
        const result = await adminVenuesUtils.createVenueWithOutcome(token, { ...finalForm, status: 'active' });
        savedVenue = result.venue;
        outcome = result.outcome;
      }
      if (savedVenue && savedVenue.address !== undefined) {
        setForm((f) => ({ ...f, address: savedVenue.address || '' }));
      }
      const rawRes = savedVenue as Ivenue & { notice?: string; emailNotice?: string };
      const backendNotice = rawRes?.notice || rawRes?.emailNotice;
      if (backendNotice) setNotice(backendNotice);
      const wasArchived = !venue && warningVenues.some((v) => v._id === savedVenue._id && v.status === 'archived');
      const message = venueShared.formatVenueSaveOutcomeMessage(outcome, wasArchived);
      onSaved(backendNotice ? `${message}. ${backendNotice}` : message);
    } catch (e) {
      const err = e as { message?: string };
      setError(err.message || (venue ? 'Update failed' : 'Create failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const isFamilyNearbyOverridden = familyNearbyReset
    ? false
    : (familyNearbyTouched || Boolean(venue?.familyNearbyOverride));
  let familyNearbyStatus = 'Auto-derived';
  let familyNearbyChipColor: 'default' | 'primary' | 'secondary' = 'default';
  if (familyNearbyReset) {
    familyNearbyStatus = 'Auto-derived on save';
    familyNearbyChipColor = 'primary';
  } else if (isFamilyNearbyOverridden) {
    familyNearbyStatus = 'Manual override';
    familyNearbyChipColor = 'secondary';
  }

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
                    let postalCode = '';

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
                        } else if (c.types.includes('postal_code')) {
                          postalCode = c.long_name;
                        }
                      });
                    }

                    const streetAddress = `${streetNumber} ${route}`.trim() || place.formatted_address || prediction.description;
                    const cleanZip = postalCode ? postalCode.split('-')[0].trim() : '';

                    setForm((f) => ({
                      ...f,
                      address: streetAddress,
                      city: city || f.city,
                      usState: (country === 'US' || !country) ? (state || f.usState) : '',
                      region: (country !== 'US' && country) ? (state || f.region) : '',
                      country: country || f.country || 'US',
                      zipCode: cleanZip || f.zipCode,
                    }));
                  }
                  setSessionToken(null);
                });
              }
            }}
            renderInput={(params) => {
              const inputProps = (params as any).slotProps?.input || {};
              return (
                <TextField
                  {...params}
                  label="Address"
                  fullWidth
                  sx={{ marginBottom: 2 }}
                  data-testid="edit-venue-address"
                  slotProps={{
                    ...(params as any).slotProps,
                    input: {
                      ...inputProps,
                      endAdornment: (
                        <>
                          {loading ? <CircularProgress color="inherit" size={20} /> : null}
                          {inputProps.endAdornment}
                        </>
                      ),
                    },
                  }}
                />
              );
            }}
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
            {venueShared.COUNTRIES.map((c) => (
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
              {venueShared.US_STATES.map((s) => (
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
        <TextField
          label="Zip Code"
          fullWidth
          value={form.zipCode || ''}
          onChange={(e) => set('zipCode', e.target.value)}
          sx={{ marginBottom: 2 }}
          data-testid="edit-venue-zip"
        />
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel id="edit-venue-type-label">Venue Type</InputLabel>
          <Select labelId="edit-venue-type-label" label="Venue Type" value={form.venueType || ''}
            onChange={(e) => set('venueType', e.target.value)} data-testid="edit-venue-type">
            <MenuItem value="">None</MenuItem>
            {VENUE_TYPES.map((t) => (<MenuItem key={t} value={t}>{t}</MenuItem>))}
          </Select>
        </FormControl>
        <Help field="venueType" />
        <Box sx={{ marginBottom: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
            Booking Status (Read-Only)
          </Typography>
          <Box>
            <Chip
              label={form.bookingStatus || 'booking'}
              color={
                form.bookingStatus === 'booked' ? 'success' :
                form.bookingStatus === 'not-booking' ? 'error' : 'default'
              }
              variant="outlined"
              data-testid="edit-venue-booking-readonly"
            />
          </Box>
        </Box>
        <Help field="bookingStatus" />

        <TextField
          label="Gig Interval (months)"
          type="number"
          fullWidth
          slotProps={{ htmlInput: { min: 0 } }}
          value={form.gigInterval ?? 0}
          onChange={(e) => set('gigInterval', e.target.value === '' ? 0 : Number(e.target.value))}
          sx={{ marginBottom: 2 }}
          data-testid="edit-venue-giginterval"
        />
        <Help field="gigInterval" />

        <TextField
          label="Resume Booking Date"
          type="date"
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
          value={form.resumeBooking || ''}
          onChange={(e) => set('resumeBooking', e.target.value || null)}
          sx={{ marginBottom: 2 }}
          data-testid="edit-venue-resumebooking"
        />
        <Help field="resumeBooking" />
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
          <InputLabel id="edit-venue-attention-label">Audience Attention</InputLabel>
          <Select labelId="edit-venue-attention-label" label="Audience Attention" value={form.audienceAttention || ''}
            onChange={(e) => set('audienceAttention', e.target.value)} data-testid="edit-venue-attention">
            <MenuItem value="">Unset</MenuItem>
            {AUDIENCE_ATTENTIONS.map((a) => (<MenuItem key={a} value={a}>{a}</MenuItem>))}
          </Select>
        </FormControl>
        <Help field="audienceAttention" />
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
        <TextField
          label="Pay Amount"
          type="number"
          fullWidth
          slotProps={{ htmlInput: { min: 0, step: 'any' } }}
          value={form.payAmount ?? ''}
          onChange={(e) => set('payAmount', e.target.value === '' ? undefined : Number(e.target.value))}
          sx={{ marginBottom: 1 }}
          data-testid="edit-venue-pay"
        />
        <Help field="payAmount" />
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
                checked={!!form.personalFavorite}
                onChange={(e) => set('personalFavorite', e.target.checked)}
                aria-label="personal favorite"
                data-testid="edit-venue-personal-favorite"
              />
            )}
            label="Personal favorite (patron favorite — would visit anyway)"
          />
          <Help field="personalFavorite" />

          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <FormControlLabel
              control={(
                <Checkbox
                  checked={!!form.familyNearby}
                  indeterminate={familyNearbyReset || undefined}
                  onChange={(e) => {
                    setFamilyNearbyTouched(true);
                    setFamilyNearbyReset(false);
                    set('familyNearby', e.target.checked);
                  }}
                  aria-label="family nearby"
                  data-testid="edit-venue-family-nearby"
                />
              )}
              label="Family nearby (within 20 miles of family)"
            />
            <Chip
              label={familyNearbyStatus}
              size="small"
              variant="outlined"
              color={familyNearbyChipColor}
              data-testid="edit-venue-family-nearby-status"
            />
            {isFamilyNearbyOverridden && (
              <Button
                type="button"
                size="small"
                variant="text"
                onClick={() => {
                  setFamilyNearbyTouched(false);
                  setFamilyNearbyReset(true);
                }}
                data-testid="edit-venue-family-nearby-recompute"
                sx={{ textTransform: 'none', py: 0, px: 1, minHeight: 0, fontSize: '0.75rem' }}
              >
                Recompute from address
              </Button>
            )}
          </Box>
          <Help field="familyNearby" />
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
        {notice && <Typography color="info.main" sx={{ marginTop: 1 }} data-testid="edit-venue-notice">{notice}</Typography>}
        {inventoryError && (
          <Box role="alert">
            <Typography color="error">{inventoryError}</Typography>
            <Button onClick={() => setInventoryAttempt((n) => n + 1)}>Retry existing-venue check</Button>
          </Box>
        )}
        {error && <Typography color="error" sx={{ marginTop: 1 }} data-testid="edit-venue-error">{error}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} data-testid="edit-venue-cancel">Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={submitting || !inventoryReady} data-testid="edit-venue-save">
          {submitting ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
