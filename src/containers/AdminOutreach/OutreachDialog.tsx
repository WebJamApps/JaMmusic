import { useState, useEffect } from 'react';
import {
  Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Divider, CircularProgress, TextField, Chip,
} from '@mui/material';
import {
  type Icandidate, type IpitchPreview, type IbatchResult, type IVenueCustomization,
  hasCompletePreviews,
} from './outreach.utils';

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
  onSend: (customizations?: IVenueCustomization[]) => void;
  onClose: () => void;
  onUpdatePreview?: (venueId: string, customIntro?: string, customBody?: string) => Promise<void>;
}

interface IeditDraft {
  customIntro: string;
  customBody: string;
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
  onUpdatePreview,
}: IoutreachDialogProps) {
  const [openEdits, setOpenEdits] = useState<Record<string, boolean>>({});
  const [drafts, setDrafts] = useState<Record<string, IeditDraft>>({});
  const [rebuilt, setRebuilt] = useState<Record<string, IeditDraft>>({});
  const [updatingVenueId, setUpdatingVenueId] = useState<string | null>(null);
  const [updateErrors, setUpdateErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      setOpenEdits({});
      setDrafts({});
      setRebuilt({});
      setUpdatingVenueId(null);
      setUpdateErrors({});
    }
  }, [open]);

  const candidateMap = new Map(candidates.map((c) => [c._id, c]));
  const selectedVenues = candidates.filter((c) => selected.has(c._id));
  const sendLabel = sending ? 'Sending…' : `Approve all ${selectedVenues.length} emails and send`;
  const complete = hasCompletePreviews([...selected], previews);

  const hasUnrebuiltEdits = Object.keys(drafts).some((venueId) => {
    const draft = drafts[venueId];
    const reb = rebuilt[venueId];
    const introDraft = draft?.customIntro ?? '';
    const bodyDraft = draft?.customBody ?? '';
    const introReb = reb?.customIntro ?? '';
    const bodyReb = reb?.customBody ?? '';
    return introDraft !== introReb || bodyDraft !== bodyReb;
  });

  const venueCustomizations: IVenueCustomization[] = Object.entries(rebuilt)
    .filter(([, custom]) => Boolean(
      (custom.customIntro && custom.customIntro.trim()) || (custom.customBody && custom.customBody.trim()),
    ))
    .map(([venueId, custom]) => {
      const item: IVenueCustomization = { venueId };
      if (custom.customIntro && custom.customIntro.trim()) item.customIntro = custom.customIntro;
      if (custom.customBody && custom.customBody.trim()) item.customBody = custom.customBody;
      return item;
    });

  const toggleEdit = (venueId: string) => {
    setOpenEdits((prev) => ({ ...prev, [venueId]: !prev[venueId] }));
    if (!drafts[venueId]) {
      setDrafts((prev) => ({
        ...prev,
        [venueId]: {
          customIntro: rebuilt[venueId]?.customIntro ?? '',
          customBody: rebuilt[venueId]?.customBody ?? '',
        },
      }));
    }
  };

  const setDraftField = (venueId: string, field: 'customIntro' | 'customBody', value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [venueId]: {
        customIntro: field === 'customIntro' ? value : (prev[venueId]?.customIntro ?? ''),
        customBody: field === 'customBody' ? value : (prev[venueId]?.customBody ?? ''),
      },
    }));
  };

  const isVenueEdited = (venueId: string) => {
    const reb = rebuilt[venueId];
    return Boolean((reb?.customIntro && reb.customIntro.trim()) || (reb?.customBody && reb.customBody.trim()));
  };

  const isVenueDirty = (venueId: string) => {
    const draft = drafts[venueId];
    const reb = rebuilt[venueId];
    const introDraft = draft?.customIntro ?? '';
    const bodyDraft = draft?.customBody ?? '';
    const introReb = reb?.customIntro ?? '';
    const bodyReb = reb?.customBody ?? '';
    return introDraft !== introReb || bodyDraft !== bodyReb;
  };

  const handleUpdatePreview = async (venueId: string) => {
    if (!onUpdatePreview) return;
    setUpdatingVenueId(venueId);
    setUpdateErrors((prev) => ({ ...prev, [venueId]: '' }));
    const draft = drafts[venueId] || { customIntro: '', customBody: '' };
    try {
      await onUpdatePreview(
        venueId,
        draft.customIntro.trim() ? draft.customIntro : undefined,
        draft.customBody.trim() ? draft.customBody : undefined,
      );
      setRebuilt((prev) => ({ ...prev, [venueId]: { ...draft } }));
    } catch (err) {
      setUpdateErrors((prev) => ({ ...prev, [venueId]: (err as Error).message || 'Failed to update preview' }));
    } finally {
      setUpdatingVenueId(null);
    }
  };

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
                {v.lastPitchDate && (
                  <Typography component="span" variant="body2" sx={{ color: 'text.secondary', ml: 1 }}>
                    (Pitched {new Date(v.lastPitchDate).toLocaleDateString()}, no reply recorded)
                  </Typography>
                )}
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle2">{p.venueName}</Typography>
                {candidateMap.get(p.venueId)?.lastPitchDate && (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Pitched {new Date(candidateMap.get(p.venueId)!.lastPitchDate!).toLocaleDateString()}, no reply recorded
                  </Typography>
                )}
                {isVenueEdited(p.venueId) && (
                  <Chip size="small" label="Edited" color="primary" variant="outlined" data-testid={`edited-mark-${p.venueId}`} />
                )}
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() => toggleEdit(p.venueId)}
                data-testid={`edit-toggle-${p.venueId}`}
              >
                {openEdits[p.venueId] ? 'Close Edit' : 'Edit'}
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Subject: {p.subject}
            </Typography>

            {openEdits[p.venueId] && (
              <Box
                sx={{
                  my: 1.5, p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider',
                }}
                data-testid={`edit-box-${p.venueId}`}
              >
                <TextField
                  label="Opening"
                  fullWidth
                  multiline
                  minRows={2}
                  size="small"
                  value={drafts[p.venueId]?.customIntro ?? ''}
                  onChange={(e) => setDraftField(p.venueId, 'customIntro', e.target.value)}
                  placeholder="Replaces greeting and opening (customIntro)"
                  data-testid={`edit-intro-${p.venueId}`}
                  sx={{ mb: 1.5 }}
                />
                <TextField
                  label="Extra paragraph"
                  fullWidth
                  multiline
                  minRows={2}
                  size="small"
                  value={drafts[p.venueId]?.customBody ?? ''}
                  onChange={(e) => setDraftField(p.venueId, 'customBody', e.target.value)}
                  placeholder="Inserted at [Custom Body] marker (customBody)"
                  data-testid={`edit-body-${p.venueId}`}
                  sx={{ mb: 1.5 }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleUpdatePreview(p.venueId)}
                    disabled={updatingVenueId === p.venueId || !isVenueDirty(p.venueId)}
                    data-testid={`update-preview-${p.venueId}`}
                  >
                    {updatingVenueId === p.venueId ? 'Updating…' : 'Update preview'}
                  </Button>
                  {updateErrors[p.venueId] && (
                    <Typography color="error" variant="caption" data-testid={`update-error-${p.venueId}`}>
                      {updateErrors[p.venueId]}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

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
        <Button
          variant="contained"
          onClick={() => onSend(venueCustomizations)}
          disabled={
            sending || sendAttempted || needsVenueConfirmation || previewLoading
            || Boolean(previewError) || !complete || hasUnrebuiltEdits || updatingVenueId !== null
          }
          data-testid="outreach-dialog-send"
        >
          {sendLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
