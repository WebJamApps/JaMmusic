import {
  useCallback, useContext, useEffect, useState,
} from 'react';
import { Box, Typography } from '@mui/material';
import { AuthContext } from 'src/providers/Auth.provider';
import { VenuesTable } from './VenuesTable';
import { EditVenueDialog } from './EditVenueDialog';
import { BatchApproval } from './BatchApproval';
import adminVenuesUtils, { type Ivenue } from './admin-venues.utils';

export function AdminVenues() {
  const { auth } = useContext(AuthContext);
  const allowed = adminVenuesUtils.getAllowedAdminRoles();
  const isAuthorized = auth.isAuthenticated && allowed.indexOf(auth.user.userType) !== -1;

  const [venues, setVenues] = useState<Ivenue[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Ivenue | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthorized) return;
    setLoading(true);
    setError('');
    try {
      const data = await adminVenuesUtils.listVenues(auth.token);
      setVenues(data);
    } catch (e) {
      setError((e as { message?: string }).message || 'Failed to load venues');
    } finally {
      setLoading(false);
    }
  }, [auth.token, isAuthorized]);

  useEffect(() => { void refresh(); }, [refresh]);

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
      <Typography variant="h5" sx={{ marginBottom: 2 }}>Admin Venues</Typography>
      {loading && <Typography data-testid="admin-venues-loading">Loading...</Typography>}
      {error && <Typography color="error" data-testid="admin-venues-error">{error}</Typography>}
      <VenuesTable venues={venues} onEdit={(v) => setEditing(v)} />
      <EditVenueDialog
        open={editing !== null}
        venue={editing}
        token={auth.token}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); void refresh(); }}
      />
      <BatchApproval token={auth.token} />
    </Box>
  );
}
