import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { US_STATES } from 'src/containers/AdminVenues/venue-shared.utils';
import type { useGigVenue } from './useGigVenue';

export function GigVenueFields({ form, onChange, disabled }: {
  form: ReturnType<typeof useGigVenue>; onChange?: () => void; disabled: boolean;
}) {
  const { fields, setFields, validation } = form;
  const change = (key: keyof typeof fields, value: string) => {
    setFields((previous) => ({ ...previous, [key]: value }));
    onChange?.();
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: '10px 0 20px' }}>
      {(['name', 'address', 'city', 'zipCode', 'website'] as const).map((key) => {
        const labels = { name: '* Venue Name', address: '* Street Address', city: '* City', zipCode: '* Zip Code', website: 'Website' };
        // eslint-disable-next-line security/detect-object-injection
        const error = validation.errors[key];
        return (
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
