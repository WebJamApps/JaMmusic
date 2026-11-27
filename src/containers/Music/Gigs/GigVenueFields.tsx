import { Fragment } from 'react';
import { Autocomplete, Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { US_STATES } from 'src/containers/AdminVenues/venue-shared.utils';
import { addressFields, formatListingOption, useAddressLookup } from 'src/containers/AdminVenues/venue-address-lookup';
import type { useGigVenue } from './useGigVenue';

export function GigVenueFields({ form, onChange, disabled, open, token }: {
  form: ReturnType<typeof useGigVenue>; onChange?: () => void; disabled: boolean; open: boolean; token: string;
}) {
  const { fields, setFields, validation } = form;
  const lookup = useAddressLookup(open && !disabled, token, (listing) => {
    setFields((previous) => {
      const selected = addressFields(listing, previous);
      return {
        ...previous,
        name: selected.name || '',
        address: selected.address || '',
        city: selected.city || '',
        usState: selected.usState || '',
        zipCode: selected.zipCode || '',
        website: selected.website || '',
        location: selected.location,
      };
    });
    onChange?.();
  });
  const change = (key: 'name' | 'address' | 'city' | 'zipCode' | 'website' | 'usState', value: string) => {
    const addressChanged = ['address', 'city', 'usState', 'zipCode'].includes(key);
    if (addressChanged) lookup.invalidate();
    setFields((previous) => ({ ...previous, [key]: value, ...(addressChanged ? { location: undefined } : {}) }));
    onChange?.();
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: '10px 0 20px' }}>
      {(['name', 'address', 'city', 'zipCode', 'website'] as const).map((key) => {
        const labels = { name: '* Venue Name', address: '* Street Address', city: '* City', zipCode: '* Zip Code', website: 'Website' };
        // eslint-disable-next-line security/detect-object-injection
        const error = validation.errors[key];
        return (
          key === 'name' ? (
            <Fragment key={key}>
              <Autocomplete
                freeSolo
                disabled={disabled}
                options={lookup.suggestions}
                getOptionLabel={(option) => typeof option === 'string' ? option : formatListingOption(option)}
                getOptionKey={(option) => typeof option === 'string' ? option : option.listingId}
                filterOptions={(options) => options}
                inputValue={fields.name}
                loading={lookup.loading}
                onInputChange={(_, input, reason) => {
                  if (reason !== 'input' && reason !== 'clear') return;
                  change('name', input);
                  lookup.search(input);
                }}
                onChange={(_, value) => {
                  if (value && typeof value !== 'string') lookup.select(value);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="* Venue Name" fullWidth error={Boolean(error)} helperText={error || ''} />
                )}
              />
              {lookup.message && <div role="status">{lookup.message}</div>}
            </Fragment>
          ) : (
            <TextField
              key={key}
              // eslint-disable-next-line security/detect-object-injection
              label={labels[key]}
              fullWidth
              disabled={disabled}
              // eslint-disable-next-line security/detect-object-injection
              value={fields[key]}
              onChange={(event) => change(key, event.target.value)}
              error={Boolean(error)}
              helperText={error || (key === 'website' ? "This becomes the venue's link on the public gigs page." : '')}
            />
          )
        );
      })}
      <FormControl fullWidth>
        <InputLabel id="gig-us-state-label">* State</InputLabel>
        <Select
          labelId="gig-us-state-label" id="gig-us-state" value={fields.usState} label="* State" disabled={disabled}
          onChange={(event) => change('usState', event.target.value)}
        >
          {US_STATES.map((state) => <MenuItem key={state.code} value={state.code}>{state.name}</MenuItem>)}
        </Select>
      </FormControl>
      {form.warning.hasWarning && <div role="status" style={{ whiteSpace: 'pre-line' }}>{form.warning.message}</div>}
      {form.inventoryError && (
        <div role="alert">
          {form.inventoryError}
          <Button onClick={form.retryInventory} disabled={disabled}>Retry venue check</Button>
        </div>
      )}
      {!form.ready && !form.inventoryError && <div role="status">Checking existing venues…</div>}
    </Box>
  );
}
