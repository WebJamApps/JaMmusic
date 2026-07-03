import {
  useCallback, useContext, useEffect, useState,
} from 'react';
import {
  Box, Typography, Button, Switch, FormControlLabel,
} from '@mui/material';
import { AuthContext } from 'src/providers/Auth.provider';
import { VenuesTable } from './VenuesTable';
import { EditVenueDialog } from './EditVenueDialog';
import adminVenuesUtils, { type Ivenue } from './admin-venues.utils';

export function AdminVenues() {
  const { auth } = useContext(AuthContext);
  const allowed = adminVenuesUtils.getAllowedAdminRoles();
  const isAuthorized = auth.isAuthenticated && allowed.indexOf(auth.user.userType) !== -1;

  const [venues, setVenues] = useState<Ivenue[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Ivenue | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  // The target-weekend filter: a date the venue must be free for (no gig within
  // its ±2-month clear window). Empty = show all venues.
  const [targetDate, setTargetDate] = useState('');

  const refresh = useCallback(async () => {
    if (!isAuthorized) return;
    setLoading(true);
    setError('');
    try {
      let data: Ivenue[];
      if (showArchived) {
        data = await adminVenuesUtils.listVenues(auth.token, undefined, 'archived');
      } else {
        data = targetDate
          ? await adminVenuesUtils.listVenues(auth.token, targetDate)
          : await adminVenuesUtils.listVenues(auth.token);
      }
      setVenues(data);
    } catch (e) {
      setError((e as { message?: string }).message || 'Failed to load venues');
    } finally {
      setLoading(false);
    }
  }, [auth.token, isAuthorized, targetDate, showArchived]);

  useEffect(() => { void refresh(); }, [refresh]);

  const handleDelete = useCallback(async (venue: Ivenue) => {
    setError('');
    try {
      await adminVenuesUtils.deleteVenue(auth.token, venue._id);
      await refresh();
    } catch (e) {
      setError((e as { message?: string }).message || 'Failed to archive venue');
    }
  }, [auth.token, refresh]);

  const handleRestore = useCallback(async (venue: Ivenue) => {
    setError('');
    try {
      await adminVenuesUtils.updateVenue(auth.token, venue._id, { status: 'active' });
      await refresh();
    } catch (e) {
      setError((e as { message?: string }).message || 'Failed to restore venue');
    }
  }, [auth.token, refresh]);

  if (!isAuthorized) {
    return (
      <Box sx={{ padding: 3 }} data-testid="admin-venues-unauthorized">
        <Typography variant="h6">Not authorized</Typography>
        <Typography variant="body2">You must be signed in as an admin to view this page.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      padding: 3, maxWidth: 1200, margin: 'auto', width: '100%', minWidth: 0,
    }} data-testid="admin-venues-page">
      {loading && <Typography data-testid="admin-venues-loading">Loading...</Typography>}
      {error && <Typography color="error" data-testid="admin-venues-error">{error}</Typography>}

      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
        flexWrap: 'wrap',
        gap: 2,
      }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Admin Venues</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showArchived}
                onChange={(e) => {
                  setShowArchived(e.target.checked);
                  if (e.target.checked) setTargetDate('');
                }}
                color="secondary"
                data-testid="venues-show-archived-toggle"
              />
            }
            label="Show archived"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsCreating(true)}
            data-testid="admin-venues-add-button"
            sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 'bold' }}
          >
            Add Venue
          </Button>
        </Box>
      </Box>

      <VenuesTable
        venues={venues}
        onEdit={(v) => setEditing(v)}
        onDelete={handleDelete}
        onRestore={handleRestore}
        showArchived={showArchived}
        targetDate={targetDate}
        setTargetDate={setTargetDate}
      />
      <EditVenueDialog
        open={editing !== null || isCreating}
        venue={editing}
        token={auth.token}
        existingVenues={venues}
        onClose={() => { setEditing(null); setIsCreating(false); }}
        onSaved={() => { setEditing(null); setIsCreating(false); void refresh(); }}
      />
    </Box>
  );
}
