import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, FormGroup, FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { CAPABILITY_GROUPS, USER_ROLES, type Capability } from './capabilities';
import adminUtils, { type IadminUser } from './admin-users.utils';

interface IeditPrivilegesDialogProps {
  open: boolean;
  user: IadminUser | null;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}

export function EditPrivilegesDialog({
  open, user, token, onClose, onSaved,
}: IeditPrivilegesDialogProps): JSX.Element {
  const [privileges, setPrivileges] = useState<Capability[]>([]);
  const [userType, setUserType] = useState<string>('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setPrivileges((user.privileges || []) as Capability[]);
      setUserType(user.userType || '');
    }
    setError('');
  }, [user]);

  const toggleCapability = (cap: Capability) => {
    setPrivileges((prev) => (prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]));
  };

  const handleSave = async () => {
    if (!user) return;
    setSubmitting(true);
    setError('');
    try {
      await adminUtils.updateUser(token, user._id, { privileges, userType });
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
        <FormControl fullWidth sx={{ marginTop: 1, marginBottom: 3 }}>
          <InputLabel id="edit-user-role-label">Role</InputLabel>
          <Select
            labelId="edit-user-role-label"
            value={userType}
            label="Role"
            onChange={(e) => setUserType(e.target.value)}
            data-testid="edit-user-role"
          >
            {USER_ROLES.filter((r) => (user?.userStatus === 'ai-agent' ? r === 'web-jam-llm' : r !== 'web-jam-llm')).map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>
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
                      data-testid={`edit-cap-${cap}`}
                    />
                  )}
                  label={cap.split(':')[1]}
                />
              ))}
            </FormGroup>
          </Box>
        ))}
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
