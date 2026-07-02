import {
  useCallback, useContext, useEffect, useState,
} from 'react';
import {
  Box, Typography, TextField, Button,
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
  // The target-weekend filter: a date the venue must be free for (no gig within
  // its ±2-month clear window). Empty = show all venues.
  const [targetDate, setTargetDate] = useState('');

  const refresh = useCallback(async () => {
    if (!isAuthorized) return;
    setLoading(true);
    setError('');
    try {
      const data = targetDate
        ? await adminVenuesUtils.listVenues(auth.token, targetDate)
        : await adminVenuesUtils.listVenues(auth.token);
      setVenues(data);
    } catch (e) {
      setError((e as { message?: string }).message || 'Failed to load venues');
    } finally {
      setLoading(false);
    }
  }, [auth.token, isAuthorized, targetDate]);

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
      <VenuesTable
        venues={venues}
        onEdit={(v) => setEditing(v)}
        onDelete={handleDelete}
        targetDate={targetDate}
        setTargetDate={setTargetDate}
      />
      <EditVenueDialog
        open={editing !== null}
        venue={editing}
        token={auth.token}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); void refresh(); }}
      />
    </Box>
  );
}
