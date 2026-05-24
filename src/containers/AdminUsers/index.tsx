import { useCallback, useContext, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { AuthContext } from 'src/providers/Auth.provider';
import { CreateUserForm } from './CreateUserForm';
import { UsersTable } from './UsersTable';
import { ShowTokenDialog } from './ShowTokenDialog';
import { EditPrivilegesDialog } from './EditPrivilegesDialog';
import adminUtils, { type IadminUser } from './admin-users.utils';

export function AdminUsers() {
  const { auth } = useContext(AuthContext);
  const allowed = adminUtils.getAllowedAdminRoles();
  const isAuthorized = auth.isAuthenticated && allowed.indexOf(auth.user.userType) !== -1;

  const [users, setUsers] = useState<IadminUser[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenShown, setTokenShown] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<IadminUser | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthorized) return;
    setLoading(true);
    setError('');
    try {
      const data = await adminUtils.listUsers(auth.token);
      setUsers(data);
    } catch (e) {
      const err = e as { response?: { body?: { message?: string } }; message?: string };
      setError(err.response?.body?.message || err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [auth.token, isAuthorized]);

  useEffect(() => { void refresh(); }, [refresh]);

  if (!isAuthorized) {
    return (
      <Box sx={{ padding: 3 }} data-testid="admin-users-unauthorized">
        <Typography variant="h6">Not authorized</Typography>
        <Typography variant="body2">You must be signed in as an admin to view this page.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3, maxWidth: 1200, margin: 'auto' }} data-testid="admin-users-page">
      <Typography variant="h5" sx={{ marginBottom: 2 }}>Admin Users</Typography>
      <CreateUserForm token={auth.token} onCreated={refresh} />
      {loading && <Typography data-testid="admin-users-loading">Loading...</Typography>}
      {error && <Typography color="error" data-testid="admin-users-error">{error}</Typography>}
      <UsersTable
        users={users}
        token={auth.token}
        onShowToken={(t) => setTokenShown(t)}
        onEditPrivileges={(u) => setEditingUser(u)}
        onChange={refresh}
      />
      <ShowTokenDialog
        open={tokenShown !== null}
        token={tokenShown || ''}
        onClose={() => setTokenShown(null)}
      />
      <EditPrivilegesDialog
        open={editingUser !== null}
        user={editingUser}
        token={auth.token}
        onClose={() => setEditingUser(null)}
        onSaved={() => { setEditingUser(null); void refresh(); }}
      />
    </Box>
  );
}
