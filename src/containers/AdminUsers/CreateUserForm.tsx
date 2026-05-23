import { useState } from 'react';
import {
  TextField, Button, FormControl, InputLabel, Select, MenuItem, FormGroup, FormControlLabel, Checkbox, Box, Typography,
} from '@mui/material';
import { CAPABILITY_GROUPS, USER_STATUS_OPTIONS, USER_ROLES, type Capability } from './capabilities';
import adminUtils from './admin-users.utils';

interface IcreateUserFormProps {
  token: string;
  onCreated: () => void;
}

export function CreateUserForm({ token, onCreated }: IcreateUserFormProps): JSX.Element {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userStatus, setUserStatus] = useState<string>('human');
  const [userType, setUserType] = useState<string>('JaM-admin');
  const [privileges, setPrivileges] = useState<Capability[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleCapability = (cap: Capability) => {
    setPrivileges((prev) => (prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]));
  };

  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) { setError('Name is required'); return; }
    if (!email.trim()) { setError('Email is required'); return; }
    setSubmitting(true);
    try {
      await adminUtils.createUser(token, {
        name: name.trim(),
        email: email.trim(),
        userType,
        userStatus,
        privileges,
        userDetails: notes,
      });
      setName(''); setEmail(''); setUserStatus('human'); setUserType('JaM-admin'); setPrivileges([]); setNotes('');
      onCreated();
    } catch (e) {
      const err = e as { response?: { body?: { message?: string } }; message?: string };
      setError(err.response?.body?.message || err.message || 'Create failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className="create-user-form" sx={{ padding: 2, border: '1px solid #ddd', borderRadius: 1, marginBottom: 3 }}>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>Create User</Typography>
      <TextField
        label="Name"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ marginBottom: 2 }}
        data-testid="create-user-name"
      />
      <TextField
        label="Email"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ marginBottom: 2 }}
        data-testid="create-user-email"
      />
      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <InputLabel id="user-status-label">Type</InputLabel>
        <Select
          labelId="user-status-label"
          value={userStatus}
          label="Type"
          onChange={(e) => setUserStatus(e.target.value)}
          data-testid="create-user-status"
        >
          {USER_STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </Select>
      </FormControl>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="subtitle2" sx={{ marginBottom: 1 }}>Privileges</Typography>
        {CAPABILITY_GROUPS.map((group) => (
          <Box key={group.label} sx={{ marginBottom: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: '70px' }}>{group.label}</Typography>
            <FormGroup row>
              {group.items.map((cap) => (
                <FormControlLabel
                  key={cap}
                  control={(
                    <Checkbox
                      checked={privileges.includes(cap)}
                      onChange={() => toggleCapability(cap)}
                      aria-label={cap}
                      data-testid={`cap-${cap}`}
                    />
                  )}
                  label={cap.split(':')[1]}
                />
              ))}
            </FormGroup>
          </Box>
        ))}
      </Box>
      <TextField
        label="Notes"
        fullWidth
        multiline
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        sx={{ marginBottom: 2 }}
      />
      {error && <Typography color="error" sx={{ marginBottom: 2 }}>{error}</Typography>}
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={submitting}
        data-testid="create-user-submit"
      >
        {submitting ? 'Creating...' : 'Create User'}
      </Button>
    </Box>
  );
}
