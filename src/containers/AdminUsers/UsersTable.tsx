import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, Button, Chip, Box,
} from '@mui/material';
import adminUtils, { type IadminUser } from './admin-users.utils';

type Order = 'asc' | 'desc';

const COLUMNS: { key: string; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'artist', label: 'Artist' },
  { key: 'type', label: 'Type' },
  { key: 'privileges', label: 'Privileges' },
  { key: 'notes', label: 'Notes' },
];

// The value each column sorts by (also what the row cells display).
export function sortValue(u: IadminUser, key: string): string {
  switch (key) {
    case 'name': return u.name || '';
    case 'email': return u.email || '';
    case 'role': return u.userType || 'N/A';
    case 'artist': return u.artist || '';
    case 'type': return u.userStatus || 'human';
    case 'privileges': return (u.privileges || []).join(', ');
    case 'notes': return u.userDetails || '';
    default: return '';
  }
}

interface IusersTableProps {
  users: IadminUser[];
  token: string;
  onShowToken: (token: string) => void;
  onEditPrivileges: (user: IadminUser) => void;
  onChange: () => void;
}

export function UsersTable({
  users, token, onShowToken, onEditPrivileges, onChange,
}: IusersTableProps) {
  const [busy, setBusy] = useState<string>('');
  const [orderBy, setOrderBy] = useState<string>('name');
  const [order, setOrder] = useState<Order>('asc');

  const handleSort = (key: string) => {
    if (orderBy === key) { setOrder(order === 'asc' ? 'desc' : 'asc'); } else { setOrderBy(key); setOrder('asc'); }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const av = sortValue(a, orderBy).toLowerCase();
    const bv = sortValue(b, orderBy).toLowerCase();
    if (av < bv) return order === 'asc' ? -1 : 1;
    if (av > bv) return order === 'asc' ? 1 : -1;
    return 0;
  });

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
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Table data-testid="users-table" size="small" sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow>
            {COLUMNS.map((col) => (
              <TableCell key={col.key} sortDirection={orderBy === col.key ? order : false}>
                <TableSortLabel
                  active={orderBy === col.key}
                  direction={orderBy === col.key ? order : 'asc'}
                  onClick={() => handleSort(col.key)}
                  data-testid={`sort-${col.key}`}
                >
                  {col.label}
                </TableSortLabel>
              </TableCell>
            ))}
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedUsers.map((u) => (
            <TableRow key={u._id} data-testid={`user-row-${u._id}`}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <Chip label={u.userType || 'N/A'} color="primary" variant="outlined" size="small" />
              </TableCell>
              <TableCell>{u.artist || ''}</TableCell>
              <TableCell>
                <Chip label={u.userStatus || 'human'} size="small" />
              </TableCell>
              <TableCell>
                {(u.privileges || []).map((p) => <Chip key={p} label={p} size="small" sx={{ margin: '2px' }} />)}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'pre-wrap', maxWidth: 240 }}>{u.userDetails}</TableCell>
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
                  Edit User
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
    </Box>
  );
}
