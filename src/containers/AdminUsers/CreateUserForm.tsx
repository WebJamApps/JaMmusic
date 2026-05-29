import { useState } from 'react';
import {
  TextField, Button, FormControl, InputLabel, Select, MenuItem, FormGroup, FormControlLabel, Checkbox, Box, Typography, Divider,
} from '@mui/material';
import { CAPABILITY_GROUPS, USER_STATUS_OPTIONS, USER_ROLES, type Capability } from './capabilities';
import adminUtils from './admin-users.utils';

interface IcreateUserFormProps {
  token: string;
  onCreated: () => void;
}

export function CreateUserForm({ token, onCreated }: IcreateUserFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userStatus, setUserStatus] = useState<string>('human');
  const [userType, setUserType] = useState<string>('');
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
      setName(''); setEmail(''); setUserStatus('human'); setUserType(''); setPrivileges([]); setNotes('');
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
          onChange={(e) => {
            const val = e.target.value;
            setUserStatus(val);
            if (val === 'ai-agent') setUserType('web-jam-llm');
            else if (userType === 'web-jam-llm') setUserType('');
          }}
          data-testid="create-user-status"
        >
          {USER_STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <InputLabel id="create-user-role-label">Role</InputLabel>
        <Select
          labelId="create-user-role-label"
          value={userType}
          label="Role"
          onChange={(e) => setUserType(e.target.value)}
          data-testid="create-user-role"
        >
          <MenuItem value="">None</MenuItem>
          {USER_ROLES.filter((r) => (userStatus === 'ai-agent' ? r === 'web-jam-llm' : r !== 'web-jam-llm')).map((r) => (
            <MenuItem key={r} value={r}>{r}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="subtitle2" sx={{ marginBottom: 1 }}>Privileges</Typography>
        {CAPABILITY_GROUPS.map((group) => (
          <Box key={group.label} sx={{ width: '100%', borderBottom: '1px solid #ccc' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minHeight: '44px' }}>
              <Typography variant="body2"
                sx={{ fontWeight: 'bold', minWidth: '110px', m: 0, mt: '20px', lineHeight: '44px' }}>{group.label}</Typography>
              <FormGroup row sx={{ flexWrap: 'nowrap', margin: 0 }}>
                {(['read', 'create', 'edit', 'delete'] as const).map((action) => {
                  const cap = group.items.find((item) => item.endsWith(`:${action}`));
                  return cap ? (
                    <FormControlLabel
                      key={cap}
                      sx={{ minWidth: '100px', m: 0 }}
                      control={(
                        <Checkbox
                          size="small"
                          checked={privileges.includes(cap)}
                          onChange={() => toggleCapability(cap)}
                          aria-label={cap}
                          data-testid={`cap-${cap}`}
                        />
                      )}
                      label={cap.split(':')[1]}
                    />
                  ) : (
                    <Box key={action} sx={{ minWidth: '100px' }} />
                  );
                })}
              </FormGroup>
            </Box>
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
