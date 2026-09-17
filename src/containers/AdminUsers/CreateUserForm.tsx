import { useState } from 'react';
import {
  TextField, Button, FormControl, InputLabel, Select, MenuItem, FormGroup, FormControlLabel, Checkbox, Box, Typography,
} from '@mui/material';
import {
  CAPABILITY_GROUPS, USER_STATUS_OPTIONS, USER_ROLES, type Capability, isAiAgent, isHumanUser,
} from './capabilities';
import adminUtils from './admin-users.utils';

interface IcreateUserFormProps {
  token: string;
  onCreated: () => void;
}

export function CreateUserForm({ token, onCreated }: IcreateUserFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userStatus, setUserStatus] = useState<string>('');
  const [userType, setUserType] = useState<string>('');
  const [privileges, setPrivileges] = useState<Capability[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAgent = isAiAgent(userType, userStatus);
  const isHuman = isHumanUser(userType, userStatus);
  const canApprove = isHuman;

  const toggleCapability = (cap: Capability) => {
    if (cap === 'outreach:approve' && !canApprove) return;
    setPrivileges((prev) => (prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]));
  };

  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) { setError('Name is required'); return; }
    if (!email.trim()) { setError('Email is required'); return; }
    setSubmitting(true);
    const privilegesToSend = isHuman ? privileges : privileges.filter((c) => c !== 'outreach:approve');
    try {
      await adminUtils.createUser(token, {
        name: name.trim(),
        email: email.trim(),
        userType: userType || undefined,
        userStatus: userStatus || undefined,
        privileges: privilegesToSend,
        userDetails: notes,
      });
      setName(''); setEmail(''); setUserStatus(''); setUserType(''); setPrivileges([]); setNotes('');
      onCreated();
    } catch (e) {
      const err = e as { response?: { body?: { message?: string } }; message?: string };
      setError(err.response?.body?.message || err.message || 'Create failed');
    } finally {
      setSubmitting(false);
    }
  };

  const crudActions = ['read', 'create', 'edit', 'delete'] as const;

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
            let nextRole = userType;
            if (val === 'ai-agent') {
              nextRole = 'web-jam-llm';
              setUserType('web-jam-llm');
            } else if (userType === 'web-jam-llm') {
              nextRole = '';
              setUserType('');
            }
            if (!isHumanUser(nextRole, val)) {
              setPrivileges((prev) => prev.filter((c) => c !== 'outreach:approve'));
            }
          }}
          data-testid="create-user-status"
        >
          <MenuItem value="">None</MenuItem>
          {USER_STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <InputLabel id="create-user-role-label">Role</InputLabel>
        <Select
          labelId="create-user-role-label"
          value={userType}
          label="Role"
          onChange={(e) => {
            const val = e.target.value;
            setUserType(val);
            if (!isHumanUser(val, userStatus)) {
              setPrivileges((prev) => prev.filter((c) => c !== 'outreach:approve'));
            }
          }}
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
        {CAPABILITY_GROUPS.map((group) => {
          const otherCaps = group.items.filter((item) => {
            const action = item.split(':')[1];
            return !crudActions.includes(action as typeof crudActions[number]);
          });
          // Pad the CRUD columns only as far as the last action this group actually has,
          // so a group with no CRUD member at all (Promotion) does not push its single
          // checkbox four empty columns clear of its own label.
          const lastCrudIndex = crudActions.reduce(
            (last, action, i) => (group.items.some((item) => item.endsWith(`:${action}`)) ? i : last),
            -1,
          );
          return (
            <Box key={group.label} sx={{ width: '100%', borderBottom: '1px solid #ccc' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minHeight: '44px' }}>
                <Typography variant="body2"
                  sx={{ fontWeight: 'bold', minWidth: '110px', m: 0, mt: '20px', lineHeight: '44px' }}>{group.label}</Typography>
                <FormGroup row sx={{ flexWrap: 'wrap', margin: 0, alignItems: 'center' }}>
                  {crudActions.slice(0, lastCrudIndex + 1).map((action) => {
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
                            data-testid={`create-cap-${cap}`}
                          />
                        )}
                        label={cap.split(':')[1]}
                      />
                    ) : (
                      <Box key={action} sx={{ minWidth: '100px' }} />
                    );
                  })}
                  {otherCaps.map((cap) => {
                    const isApprove = cap === 'outreach:approve';
                    const disabled = isApprove && !canApprove;
                    const checked = isApprove ? (canApprove && privileges.includes(cap)) : privileges.includes(cap);
                    return (
                      <FormControlLabel
                        key={cap}
                        sx={{ minWidth: '100px', m: 0 }}
                        control={(
                          <Checkbox
                            size="small"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => toggleCapability(cap)}
                            aria-label={cap}
                            data-testid={`create-cap-${cap}`}
                          />
                        )}
                        label={cap.split(':')[1]}
                      />
                    );
                  })}
                </FormGroup>
              </Box>
              {isAgent && group.items.includes('outreach:approve') && (
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', display: 'block', pb: 1 }}
                  data-testid="create-approve-helper-text"
                >
                  AI agents may draft but never send
                </Typography>
              )}
            </Box>
          );
        })}
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
