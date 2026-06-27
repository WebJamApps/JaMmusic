import {
  Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Divider, CircularProgress,
} from '@mui/material';
import { type Icandidate, type IpitchPreview } from './outreach.utils';

interface IoutreachDialogProps {
  open: boolean;
  candidates: Icandidate[];
  selected: Set<string>;
  targetDates: string;
  bookingPeriod: string;
  previews: IpitchPreview[];
  previewLoading: boolean;
  previewError: string;
  sending: boolean;
  onSend: () => void;
  onClose: () => void;
}

function candidateLabel(c: Icandidate): string {
  const city = c.city ? ` (${c.city})` : '';
  const type = c.venueType ? ` — ${c.venueType}` : '';
  return `${c.name}${city}${type}`;
}

export function OutreachDialog({
  open, candidates, selected, targetDates, bookingPeriod,
  previews, previewLoading, previewError, sending, onSend, onClose,
}: IoutreachDialogProps) {
  const selectedVenues = candidates.filter((c) => selected.has(c._id));
  const pitchWord = selectedVenues.length === 1 ? 'pitch' : 'pitches';
  const sendLabel = sending ? 'Sending...' : `Send ${selectedVenues.length} ${pitchWord}`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth data-testid="outreach-dialog">
      <DialogTitle>Confirm Batch Outreach</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ marginBottom: 1 }}>
          <strong>Target dates:</strong> {targetDates}
          {bookingPeriod && <> · <strong>Booking period:</strong> {bookingPeriod}</>}
        </Typography>

        <Typography variant="subtitle2" sx={{ marginTop: 1 }}>
          {selectedVenues.length} venue{selectedVenues.length !== 1 ? 's' : ''} selected:
        </Typography>
        {selectedVenues.map((v) => (
          <Typography key={v._id} variant="body2" sx={{ paddingLeft: 2 }}>
            • {candidateLabel(v)}
          </Typography>
        ))}

        <Divider sx={{ marginY: 2 }} />

        <Typography variant="subtitle2" sx={{ marginBottom: 1 }}>Pitch previews</Typography>
        {previewLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} data-testid="preview-loading">
            <CircularProgress size={16} /> <Typography variant="body2">Loading previews…</Typography>
          </Box>
        )}
        {previewError && (
          <Typography color="error" variant="body2" data-testid="preview-error">{previewError}</Typography>
        )}
        {!previewLoading && previews.length > 0 && previews.map((p) => (
          <Box key={p.venueId} sx={{ marginBottom: 2, padding: 1.5, backgroundColor: 'action.hover', borderRadius: 1 }}
            data-testid={`preview-${p.venueId}`}>
            <Typography variant="subtitle2">{p.venueName}</Typography>
            <Typography variant="caption" color="text.secondary">Subject: {p.subject}</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', marginTop: 0.5 }}>{p.body}</Typography>
          </Box>
        ))}
        {!previewLoading && !previewError && previews.length === 0 && (
          <Typography variant="body2" color="text.secondary" data-testid="preview-unavailable">
            No preview available — pitches will be generated on send.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} data-testid="outreach-dialog-cancel">Cancel</Button>
        <Button variant="contained" onClick={onSend} disabled={sending || selectedVenues.length === 0}
          data-testid="outreach-dialog-send">
          {sendLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
