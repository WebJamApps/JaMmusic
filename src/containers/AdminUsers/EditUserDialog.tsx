import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, FormGroup, FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem, TextField,
} from '@mui/material';
import { CAPABILITY_GROUPS, USER_ROLES, USER_STATUS_OPTIONS, type Capability } from './capabilities';
import adminUtils, { type IadminUser } from './admin-users.utils';

interface IeditUserDialogProps {
  open: boolean;
  user: IadminUser | null;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}

export function EditUserDialog({
  open, user, token, onClose, onSaved,
}: IeditUserDialogProps) {
  const [privileges, setPrivileges] = useState<Capability[]>([]);
  const [userType, setUserType] = useState<string>('');
  const [userStatus, setUserStatus] = useState<string>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setPrivileges((user.privileges || []) as Capability[]);
      setUserType(user.userType || '');
      setUserStatus(user.userStatus || '');
      setName(user.name || '');
      setEmail(user.email || '');
      setNotes(user.userDetails || '');
    }
    setError('');
  }, [user]);

  const toggleCapability = (cap: Capability) => {
    setPrivileges((prev) => (prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]));
  };

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) { setError('Name is required'); return; }
    if (!email.trim()) { setError('Email is required'); return; }
    setSubmitting(true);
    setError('');
    try {
      await adminUtils.updateUser(token, user._id, {
        privileges,
        userType: userType || undefined,
        userStatus: userStatus || undefined,
        name: name.trim(),
        email: email.trim(),
        userDetails: notes,
      });
      onSaved();
    } catch (e) {
      const err = e as { response?: { body?: { message?: string } }; message?: string };
      setError(err.response?.body?.message || err.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit User{user ? ` — ${user.name}` : ''}</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ marginTop: 1, marginBottom: 2 }}
          data-testid="edit-user-name"
        />
        <TextField
          label="Email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ marginBottom: 2 }}
          data-testid="edit-user-email"
        />
        <FormControl fullWidth sx={{ marginBottom: 3 }}>
          <InputLabel id="edit-user-status-label">Type</InputLabel>
          <Select
            labelId="edit-user-status-label"
            value={(USER_STATUS_OPTIONS as readonly string[]).includes(userStatus) ? userStatus : ''}
            label="Type"
            onChange={(e) => setUserStatus(e.target.value)}
            data-testid="edit-user-status"
          >
            {USER_STATUS_OPTIONS.map((s) => (
              // ai-agent is only valid for the web-jam-llm role
              <MenuItem key={s} value={s} disabled={s === 'ai-agent' && userType !== 'web-jam-llm'}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ marginBottom: 3 }}>
          <InputLabel id="edit-user-role-label">Role</InputLabel>
          <Select
            labelId="edit-user-role-label"
            value={userType}
            label="Role"
            onChange={(e) => setUserType(e.target.value)}
            data-testid="edit-user-role"
          >
            <MenuItem value="">None</MenuItem>
            {USER_ROLES.filter((r) => (userStatus === 'ai-agent' ? r === 'web-jam-llm' : r !== 'web-jam-llm')).map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>
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
                          data-testid={`edit-cap-${cap}`}
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
        <TextField
          label="Notes"
          fullWidth
          multiline
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ marginTop: 3 }}
          data-testid="edit-user-notes"
        />
        {error && <Typography color="error" sx={{ marginTop: 1 }}>{error}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} data-testid="edit-priv-cancel">Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={submitting} data-testid="edit-priv-save">
          {submitting ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
