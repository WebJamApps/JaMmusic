import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, TextField,
} from '@mui/material';

interface IshowTokenDialogProps {
  open: boolean;
  token: string;
  onClose: () => void;
}

export function ShowTokenDialog({ open, token, onClose }: IshowTokenDialogProps): JSX.Element {
  const copyToClipboard = async () => {
    try { await navigator.clipboard.writeText(token); } catch (_e) { /* ignore */ }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Service Token</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ marginBottom: 2 }}>
          Copy this token to your secrets manager (KeePass) now. Anyone with this token can authenticate as this user. The token has no expiration.
        </Typography>
        <Box>
          <TextField
            value={token}
            fullWidth
            multiline
            rows={4}
            InputProps={{ readOnly: true }}
            data-testid="token-value"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={copyToClipboard} data-testid="copy-token">Copy to clipboard</Button>
        <Button onClick={onClose} data-testid="close-token">Done</Button>
      </DialogActions>
    </Dialog>
  );
}
