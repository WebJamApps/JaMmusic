import {
  Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Divider, CircularProgress,
} from '@mui/material';
import { type Icandidate, type IpitchPreview, type IbatchResult, hasCompletePreviews } from './outreach.utils';

const darkPreviewStyle = '<style>html,body{background:#121214;color:#e5e7eb;color-scheme:dark;}'
  + 'body{margin:0;padding:16px;font-family:Arial,sans-serif;}a{color:#93c5fd;}</style>';

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
  storedVenues: Icandidate[];
  needsVenueConfirmation: boolean;
  onApproveVenues: () => void;
  sendAttempted: boolean;
  progress: IbatchResult | null;
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
  storedVenues, needsVenueConfirmation, onApproveVenues, sendAttempted, progress,
}: IoutreachDialogProps) {
  const selectedVenues = candidates.filter((c) => selected.has(c._id));
  const sendLabel = sending ? 'Sending…' : `Approve all ${selectedVenues.length} emails and send`;
  const complete = hasCompletePreviews([...selected], previews);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth data-testid="outreach-dialog">
      <DialogTitle>{needsVenueConfirmation ? 'Confirm venue approval' : 'Review every email'}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ marginBottom: 1 }}>
          <strong>Target dates:</strong> {targetDates}
          {bookingPeriod && <> · <strong>Booking period:</strong> {bookingPeriod}</>}
        </Typography>

        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: needsVenueConfirmation ? '1fr 1fr' : '1fr' } }}>
          {needsVenueConfirmation && (
            <Box data-testid="stored-venue-approval">
              <Typography variant="subtitle2">Previously approved venues</Typography>
              {storedVenues.map(v => <Typography key={v._id} variant="body2">{v.name} ({v._id})</Typography>)}
              <Typography variant="body2">Confirm the new set before replacing the stored approval.</Typography>
            </Box>
          )}
          <Box>
            <Typography variant="subtitle2">
              {selectedVenues.length} venue{selectedVenues.length !== 1 ? 's' : ''} selected:
            </Typography>
            {selectedVenues.map((v) => (
              <Typography key={v._id} variant="body2" sx={{ paddingLeft: 2 }}>
                • {candidateLabel(v)}
              </Typography>
            ))}
          </Box>
        </Box>

        <Divider sx={{ marginY: 2 }} />

        <Typography variant="subtitle2" sx={{ marginBottom: 1 }}>Pitch previews</Typography>
        {previewLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} data-testid="preview-loading">
            <CircularProgress size={16} /> <Typography variant="body2">Loading previews…</Typography>
          </Box>
        )}
        {progress && <Typography role="status">Sent {progress.sent}; skipped {progress.skipped.length}; remaining {progress.remaining}.</Typography>}
        {previewError && (
          <Typography color="error" variant="body2" data-testid="preview-error">{previewError}</Typography>
        )}
        {!previewLoading && previews.length > 0 && previews.map((p) => (
          <Box key={p.venueId} sx={{ marginBottom: 2, padding: 1.5, backgroundColor: 'action.hover', borderRadius: 1 }}
            data-testid={`preview-${p.venueId}`}>
            <Typography variant="subtitle2">{p.venueName}</Typography>
            <Typography variant="caption" color="text.secondary">Subject: {p.subject}</Typography>
            {/* The load event only sizes the email frame; it is not an interactive handler. */}
            {/* eslint-disable-next-line jsx-a11y-x/no-noninteractive-element-interactions */}
            <iframe
              title={`Email for ${p.venueName}`}
              sandbox="allow-same-origin"
              srcDoc={`${darkPreviewStyle}${p.body}`}
              style={{ width: '100%', border: 0, minHeight: 320, background: '#121214' }}
              onLoad={event => {
                const frame = event.currentTarget;
                const height = frame.contentDocument?.body?.scrollHeight;
                if (height) frame.style.height = `${height + 32}px`;
              }}
            />
          </Box>
        ))}
        {!previewLoading && !previewError && previews.length === 0 && (
          <Typography variant="body2" color="text.secondary" data-testid="preview-unavailable">
            Every selected venue needs a complete preview before emails can be approved.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={sending || previewLoading} data-testid="outreach-dialog-cancel">Close</Button>
        {needsVenueConfirmation && <Button variant="contained" onClick={onApproveVenues} disabled={previewLoading || sending}
          data-testid="outreach-confirm-venues">Confirm venues and review emails</Button>}
        <Button variant="contained" onClick={onSend}
          disabled={sending || sendAttempted || needsVenueConfirmation || previewLoading || Boolean(previewError) || !complete}
          data-testid="outreach-dialog-send">
          {sendLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
