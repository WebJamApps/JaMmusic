import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Button, Chip, Box,
} from '@mui/material';
import adminUtils, { type IadminUser } from './admin-users.utils';

interface IusersTableProps {
  users: IadminUser[];
  token: string;
  onShowToken: (token: string) => void;
  onEditPrivileges: (user: IadminUser) => void;
  onChange: () => void;
}

export function UsersTable({
  users, token, onShowToken, onEditPrivileges, onChange,
}: IusersTableProps): JSX.Element {
  const [busy, setBusy] = useState<string>('');

  const handleShowToken = async (userId: string) => {
    setBusy(userId);
    try {
      const newToken = await adminUtils.mintToken(token, userId);
      onShowToken(newToken);
    } catch (_e) {
      // surface as alert; keep simple for v1
      // eslint-disable-next-line no-alert
      alert('Failed to mint token');
    } finally {
      setBusy('');
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    // eslint-disable-next-line no-alert, no-restricted-globals
    if (!confirm(`Delete user "${userName}"? This invalidates any token derived from it.`)) return;
    setBusy(userId);
    try {
      await adminUtils.deleteUser(token, userId);
      onChange();
    } catch (_e) {
      // eslint-disable-next-line no-alert
      alert('Failed to delete user');
    } finally {
      setBusy('');
    }
  };

  if (users.length === 0) {
    return <Box sx={{ padding: 2, textAlign: 'center' }} data-testid="users-empty">No users yet.</Box>;
  }

  return (
    <Table data-testid="users-table">
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Role</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>Privileges</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((u) => (
          <TableRow key={u._id} data-testid={`user-row-${u._id}`}>
            <TableCell>{u.name}</TableCell>
            <TableCell>{u.email}</TableCell>
            <TableCell>
              <Chip label={u.userType || 'N/A'} color="primary" variant="outlined" size="small" />
            </TableCell>
            <TableCell>
              <Chip label={u.userStatus || 'human'} size="small" />
            </TableCell>
            <TableCell>
              {(u.privileges || []).map((p) => <Chip key={p} label={p} size="small" sx={{ margin: '2px' }} />)}
            </TableCell>
            <TableCell>
              <Button
                size="small"
                onClick={() => handleShowToken(u._id)}
                disabled={busy === u._id}
                data-testid={`show-token-${u._id}`}
              >
                Show token
              </Button>
              <Button
                size="small"
                onClick={() => onEditPrivileges(u)}
                disabled={busy === u._id}
                data-testid={`edit-priv-${u._id}`}
              >
                Edit privileges
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => handleDelete(u._id, u.name)}
                disabled={busy === u._id}
                data-testid={`delete-${u._id}`}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
