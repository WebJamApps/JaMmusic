import { Autocomplete, Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { US_STATES } from 'src/containers/AdminVenues/venue-shared.utils';
import { addressFields, useAddressLookup } from 'src/containers/AdminVenues/venue-address-lookup';
import { AddressSuggestionsPaper } from 'src/containers/AdminVenues/AddressSuggestionsPaper';
import type { useGigVenue } from './useGigVenue';

export function GigVenueFields({ form, onChange, disabled, open, token }: {
  form: ReturnType<typeof useGigVenue>; onChange?: () => void; disabled: boolean; open: boolean; token: string;
}) {
  const { fields, setFields, validation } = form;
  const lookup = useAddressLookup(open && !disabled, token, (place) => {
    setFields((previous) => {
      const selected = addressFields(place, previous);
      return {
        ...previous, address: selected.address || '', city: selected.city || '',
        usState: selected.usState || '', zipCode: selected.zipCode || '', location: selected.location,
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
          key === 'address' ? (
            <Autocomplete
              key={key}
              freeSolo
              disabled={disabled}
              options={lookup.suggestions}
              slots={{ paper: AddressSuggestionsPaper }}
              getOptionLabel={(option) => typeof option === 'string' ? option : option.text}
              filterOptions={(options) => options}
              inputValue={fields.address}
              loading={lookup.loading}
              onInputChange={(_, input, reason) => {
                if (reason !== 'input' && reason !== 'clear') return;
                change('address', input);
                lookup.search(input, 'US');
              }}
              onChange={(_, value) => {
                if (value && typeof value !== 'string') void lookup.select(value);
              }}
              renderInput={(params) => (
                <TextField {...params} label="* Street Address" fullWidth error={Boolean(error)} helperText={error || ''} />
              )}
            />
          ) : <TextField
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
        );
      })}
      {lookup.message && <div role="status">{lookup.message}</div>}
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
