import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, FormGroup, FormControlLabel, Checkbox,
} from '@mui/material';
import { CAPABILITY_GROUPS, type Capability } from './capabilities';
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
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) setPrivileges((user.privileges || []) as Capability[]);
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
      await adminUtils.updatePrivileges(token, user._id, privileges);
      onSaved();
    } catch (e) {
      const err = e as { response?: { body?: { message?: string } }; message?: string };
      setError(err.response?.body?.message || err.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Privileges{user ? ` — ${user.name}` : ''}</DialogTitle>
      <DialogContent>
        {CAPABILITY_GROUPS.map((group) => (
          <Box key={group.label} sx={{ marginBottom: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{group.label}</Typography>
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
