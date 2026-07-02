import {
  useCallback, useContext, useEffect, useState,
} from 'react';
import {
  Box, Typography, TextField, Button, Checkbox, FormControlLabel,
  Switch, Divider, Card, CardContent, Chip, Select, MenuItem,
  FormControl, InputLabel, CircularProgress,
} from '@mui/material';
import {
  Check, Undo, Warning, Info, ThumbUp, ThumbDown,
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthContext } from 'src/providers/Auth.provider';
import adminVenuesUtils, { type Ivenue } from 'src/containers/AdminVenues/admin-venues.utils';
import outreachUtils, {
  type Icandidate, type IbatchResult, type IpitchPreview, type IpendingReply,
} from './outreach.utils';
import { OutreachDialog } from './OutreachDialog';

function deriveSeason(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  const month = date.getMonth();
  const year = date.getFullYear();
  let season = '';
  if (month === 11 || month === 0 || month === 1) season = 'winter';
  else if (month >= 2 && month <= 4) season = 'spring';
  else if (month >= 5 && month <= 7) season = 'summer';
  else season = 'fall';
  return `${season} ${year}`;
}

function deriveDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  
  // Assume the picked date is the start of the weekend (e.g., Friday).
  // We'll automatically build a 3-day range (Friday to Sunday).
  const endDate = new Date(date);
  endDate.setDate(date.getDate() + 2);
  
  const startMonth = date.toLocaleDateString('en-US', { month: 'short' });
  const startDay = date.getDate();
  const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
  const endDay = endDate.getDate();
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}`;
  }
  return `${startMonth} ${startDay} to ${endMonth} ${endDay}`;
}

function candidateLabel(c: Icandidate): string {
  const city = c.city ? ` (${c.city})` : '';
  const type = c.venueType ? ` — ${c.venueType}` : '';
  return `${c.name}${city}${type}`;
}

export function AdminOutreach() {
  const { auth } = useContext(AuthContext);
  const allowed = outreachUtils.getAllowedAdminRoles();
  const isAuthorized = auth.isAuthenticated && allowed.indexOf(auth.user.userType) !== -1;

  const [structuredDate, setStructuredDate] = useState('');
  const [targetDates, setTargetDates] = useState('');
  const [bookingPeriod, setBookingPeriod] = useState('');
  const [candidates, setCandidates] = useState<Icandidate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<IbatchResult | null>(null);
  const [autoApprove, setAutoApprove] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previews, setPreviews] = useState<IpitchPreview[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');

  const [pendingReplies, setPendingReplies] = useState<IpendingReply[]>([]);
  const [venuesMap, setVenuesMap] = useState<Record<string, Ivenue>>({});
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [repliesError, setRepliesError] = useState('');
  const [localEdits, setLocalEdits] = useState<Record<string, { bookingStatus?: string; interested?: boolean }>>({});

  const loadConfig = useCallback(async () => {
    try {
      const cfg = await outreachUtils.getConfig(auth.token);
      setAutoApprove(cfg.autoApprove);
    } catch { /* non-blocking — leave the toggle off */ }
  }, [auth.token]);

  const loadPendingReplies = useCallback(async () => {
    setRepliesLoading(true);
    setRepliesError('');
    try {
      const [repliesData, venuesList] = await Promise.all([
        outreachUtils.getPendingReplies(auth.token),
        adminVenuesUtils.listVenues(auth.token),
      ]);
      setPendingReplies(repliesData);
      const map: Record<string, Ivenue> = {};
      venuesList.forEach((v) => { map[v._id] = v; });
      setVenuesMap(map);
    } catch (e) {
      setRepliesError((e as { message?: string }).message || 'Failed to load pending replies');
    } finally {
      setRepliesLoading(false);
    }
  }, [auth.token]);

  useEffect(() => {
    if (isAuthorized) {
      void loadConfig();
      void loadPendingReplies();
    }
  }, [isAuthorized, loadConfig, loadPendingReplies]);

  const handleStatusChange = (replyId: string, val: string) => {
    setLocalEdits((prev) => ({
      ...prev,
      [replyId]: { ...prev[replyId], bookingStatus: val },
    }));
  };

  const handleInterestedChange = (replyId: string, val: boolean) => {
    setLocalEdits((prev) => ({
      ...prev,
      [replyId]: { ...prev[replyId], interested: val },
    }));
  };

  const handleApplySuggestion = async (replyId: string) => {
    setError('');
    setRepliesError('');
    try {
      const edits = localEdits[replyId] || {};
      await outreachUtils.applySuggestion(auth.token, replyId, {
        bookingStatus: edits.bookingStatus,
        interested: edits.interested,
      });
      await loadPendingReplies();
    } catch (e) {
      setRepliesError((e as { message?: string }).message || 'Failed to apply suggestion');
    }
  };

  const handleReopen = async (replyId: string) => {
    setError('');
    setRepliesError('');
    try {
      await outreachUtils.applySuggestion(auth.token, replyId, { reopen: true });
      await loadPendingReplies();
    } catch (e) {
      setRepliesError((e as { message?: string }).message || 'Failed to reopen outreach');
    }
  };

  const handleDismiss = async (replyId: string) => {
    setError('');
    setRepliesError('');
    try {
      await outreachUtils.applySuggestion(auth.token, replyId, { dismiss: true });
      await loadPendingReplies();
    } catch (e) {
      setRepliesError((e as { message?: string }).message || 'Failed to dismiss suggestion');
    }
  };

  const loadCandidates = async () => {
    if (!structuredDate.trim()) { setError('Select a weekend date first'); return; }
    if (!targetDates.trim()) { setError('Enter target dates first'); return; }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await outreachUtils.getCandidates(auth.token, targetDates.trim(), structuredDate);
      setCandidates(data);
      setSelected(new Set(data.map((c) => c._id)));
    } catch (e) {
      setError((e as { message?: string }).message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const openDialog = async () => {
    if (selected.size === 0) { setError('Select at least one venue'); return; }
    setDialogOpen(true);
    setPreviewLoading(true);
    setPreviewError('');
    setPreviews([]);
    try {
      const data = await outreachUtils.getPreview(auth.token, [...selected], targetDates.trim());
      setPreviews(data);
    } catch (e) {
      setPreviewError((e as { message?: string }).message || 'Could not load previews');
    } finally {
      setPreviewLoading(false);
    }
  };

  const send = async () => {
    setSending(true);
    setError('');
    try {
      const res = await outreachUtils.sendBatch(auth.token, {
        venueIds: [...selected], targetDates: targetDates.trim(), bookingPeriod: bookingPeriod.trim() || undefined,
      });
      setResult(res);
      setCandidates([]);
      setSelected(new Set());
      setDialogOpen(false);
    } catch (e) {
      setError((e as { message?: string }).message || 'Batch send failed');
      setDialogOpen(false);
    } finally {
      setSending(false);
    }
  };

  const toggleAutoApprove = async (value: boolean) => {
    setError('');
    try {
      const cfg = await outreachUtils.setConfig(auth.token, value);
      setAutoApprove(cfg.autoApprove);
    } catch (e) {
      setError((e as { message?: string }).message || 'Failed to update auto-approve');
    }
  };

  if (!isAuthorized) {
    return (
      <Box sx={{ padding: 3 }} data-testid="admin-outreach-unauthorized">
        <Typography variant="h6">Not authorized</Typography>
        <Typography variant="body2">You must be signed in as an admin to view this page.</Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{
        padding: 3, maxWidth: 1200, margin: 'auto', width: '100%', minWidth: 0,
      }} data-testid="admin-outreach-page">
        {/* Replies to Review Section */}
        <Box sx={{ marginBottom: 4 }} data-testid="replies-review-section">
          <Typography variant="h5" sx={{ marginBottom: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            Replies to Review
            {pendingReplies.length > 0 && (
              <Box sx={{
                bgcolor: 'error.main', color: 'white', fontSize: '0.75rem', fontWeight: 'bold',
                px: 1.2, py: 0.4, borderRadius: '12px', display: 'inline-flex', alignItems: 'center',
              }} data-testid="replies-badge">
                {pendingReplies.length}
              </Box>
            )}
          </Typography>

          {repliesLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }} data-testid="replies-loading">
              <CircularProgress size={30} />
            </Box>
          )}

          {repliesError && (
            <Typography color="error" sx={{ marginBottom: 2 }} data-testid="replies-error">
              {repliesError}
            </Typography>
          )}

          {!repliesLoading && pendingReplies.length === 0 && (
            <Box sx={{
              bgcolor: 'background.paper', border: '1px dashed', borderColor: 'divider',
              borderRadius: 2, padding: 4, textAlign: 'center',
            }} data-testid="replies-empty">
              <Typography color="text.secondary">No replies to review.</Typography>
            </Box>
          )}

          {!repliesLoading && pendingReplies.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {pendingReplies.map((reply) => {
                const venue = venuesMap[reply.venueId];
                const venueName = venue?.name || reply.venueId || 'Unknown Venue';
                const isBounce = reply.replyKind === 'bounce';

                if (isBounce) {
                  return (
                    <Card
                      key={reply._id}
                      data-testid={`reply-card-${reply._id}`}
                      sx={{
                        borderLeft: '6px solid',
                        borderColor: 'error.main',
                        bgcolor: 'rgba(211, 47, 47, 0.04)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 3,
                        },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }} data-testid={`reply-venue-${reply._id}`}>
                              {venueName}
                            </Typography>
                            {venue?.city && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                {venue.city}{venue.usState ? `, ${venue.usState}` : ''}
                              </Typography>
                            )}
                            <Typography
                              variant="body2"
                              color="error.main"
                              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 'medium' }}
                              data-testid={`bounce-badge-${reply._id}`}
                            >
                              <Warning fontSize="small" /> Bounced — needs new email
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1, fontWeight: 'medium' }} data-testid={`bounce-email-${reply._id}`}>
                              Dead Email: {venue?.email || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              The outreach email failed to deliver. The system has automatically disabled outreach eligibility{' '}
                              (`outreachEligible: false`) and contact verification (`contactVerified: false`) to halt the{' '}
                              campaign. Please fix the address on the Venues tab or archive the venue.
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                }

                const edits = localEdits[reply._id] || {};
                const currentStatus = edits.bookingStatus !== undefined ? edits.bookingStatus : (reply.suggestion?.proposedBookingStatus || '');
                const currentInterested = edits.interested !== undefined ? edits.interested : (reply.suggestion?.proposedInterested || false);

                const sentimentColors: Record<string, { label: string; color: 'success' | 'error' | 'primary' | 'default' }> = {
                  positive: { label: 'Positive Reply', color: 'success' },
                  negative: { label: 'Negative Reply', color: 'error' },
                  'needs-info': { label: 'Needs Info', color: 'primary' },
                };
                const sentimentInfo = reply.suggestion?.sentiment ? sentimentColors[reply.suggestion.sentiment] : null;

                return (
                  <Card
                    key={reply._id}
                    data-testid={`reply-card-${reply._id}`}
                    sx={{
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }} data-testid={`reply-venue-${reply._id}`}>
                            {venueName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {reply.targetDates ? `Target: ${reply.targetDates}` : ''}
                            {reply.bookingPeriod ? ` (${reply.bookingPeriod})` : ''}
                            {reply.repliedAt ? ` · Replied ${new Date(reply.repliedAt).toLocaleDateString()}` : ''}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          {sentimentInfo && (
                            <Chip
                              size="small"
                              label={sentimentInfo.label}
                              color={sentimentInfo.color}
                              variant="outlined"
                              icon={
                                reply.suggestion?.sentiment === 'positive' ? <ThumbUp fontSize="small" /> :
                                reply.suggestion?.sentiment === 'negative' ? <ThumbDown fontSize="small" /> :
                                <Info fontSize="small" />
                              }
                              data-testid={`reply-sentiment-${reply._id}`}
                            />
                          )}
                          {reply.suggestion?.model && (
                            <Typography variant="caption" color="text.secondary">
                              AI: {reply.suggestion.model}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {reply.replySnippet && (
                        <Box
                          sx={{
                            bgcolor: 'action.hover',
                            borderLeft: '4px solid',
                            borderColor: 'divider',
                            borderRadius: '0 4px 4px 0',
                            padding: 1.5,
                            mb: 2,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontStyle: 'italic', whiteSpace: 'pre-wrap' }} data-testid={`reply-snippet-${reply._id}`}>
                            "{reply.replySnippet}"
                          </Typography>
                        </Box>
                      )}

                      {reply.suggestion?.rationale && (
                        <Box sx={{ mb: 2, display: 'flex', gap: 0.5, alignItems: 'flex-start' }}>
                          <Info color="action" fontSize="small" sx={{ mt: 0.2 }} />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontStyle: 'italic' }}
                            data-testid={`reply-rationale-${reply._id}`}
                          >
                            {reply.suggestion.rationale}
                          </Typography>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                          <InputLabel id={`status-label-${reply._id}`}>Proposed Venue Status</InputLabel>
                          <Select
                            labelId={`status-label-${reply._id}`}
                            id={`status-select-${reply._id}`}
                            value={currentStatus}
                            label="Proposed Venue Status"
                            onChange={(e) => handleStatusChange(reply._id, e.target.value as string)}
                            data-testid={`reply-status-select-${reply._id}`}
                          >
                            <MenuItem value="booking">booking (prospect)</MenuItem>
                            <MenuItem value="not-booking">not-booking (ruled out)</MenuItem>
                            <MenuItem value="booked">booked (confirmed)</MenuItem>
                          </Select>
                        </FormControl>

                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={currentInterested}
                              onChange={(e) => handleInterestedChange(reply._id, e.target.checked)}
                              data-testid={`reply-interested-checkbox-${reply._id}`}
                            />
                          }
                          label="Proposed Warm Lead (Interested)"
                        />
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<Check />}
                          onClick={() => handleApplySuggestion(reply._id)}
                          data-testid={`reply-apply-btn-${reply._id}`}
                        >
                          Apply Suggestion
                        </Button>
                        <Button
                          variant="outlined"
                          color="warning"
                          size="small"
                          startIcon={<Undo />}
                          onClick={() => handleReopen(reply._id)}
                          data-testid={`reply-reopen-btn-${reply._id}`}
                        >
                          Reopen
                        </Button>
                        <Button
                          variant="text"
                          color="inherit"
                          size="small"
                          onClick={() => handleDismiss(reply._id)}
                          data-testid={`reply-dismiss-btn-${reply._id}`}
                        >
                          Dismiss
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </Box>

        <Divider sx={{ marginY: 4 }} />

        <Typography variant="h5" sx={{ marginBottom: 2 }}>Batch Outreach</Typography>

      <FormControlLabel
        control={(
          <Switch checked={autoApprove} onChange={(e) => toggleAutoApprove(e.target.checked)}
            aria-label="auto-approve" data-testid="auto-approve-toggle" />
        )}
        label="Auto-approve (let the AI agent send batches without review)" />

      <Box sx={{
        display: 'flex', gap: 2, flexWrap: 'wrap', marginTop: 2, alignItems: 'flex-end',
      }}>
        <DatePicker
          label="Weekend (eligibility)"
          value={structuredDate ? new Date(`${structuredDate}T00:00:00`) : null}
          onChange={(newDate: Date | null) => {
            if (!newDate) {
              setStructuredDate('');
              setBookingPeriod('');
              setTargetDates('');
              return;
            }
            // Ensure local timezone formatting
            const year = newDate.getFullYear();
            const month = String(newDate.getMonth() + 1).padStart(2, '0');
            const day = String(newDate.getDate()).padStart(2, '0');
            const val = `${year}-${month}-${day}`;
            setStructuredDate(val);
            setBookingPeriod(deriveSeason(val));
            setTargetDates(deriveDisplayDate(val));
          }}
          data-testid="outreach-structured-date"
          slotProps={{
            textField: {
              size: 'small',
            }
          }}
        />
        <TextField
          size="small"
          label="Target dates (display)"
          value={targetDates}
          onChange={(e) => setTargetDates(e.target.value)}
          placeholder="e.g. Sept 25-27"
          data-testid="outreach-target-dates"
        />
        <TextField label="Booking period" size="small" value={bookingPeriod}
          onChange={(e) => setBookingPeriod(e.target.value)}
          placeholder="e.g. fall 2026" data-testid="outreach-booking-period" />
        <Button variant="outlined" onClick={loadCandidates} disabled={loading} data-testid="outreach-load">
          {loading ? 'Loading...' : 'Find eligible venues'}
        </Button>
      </Box>

      {error && <Typography color="error" sx={{ marginTop: 1 }} data-testid="outreach-error">{error}</Typography>}

      {candidates.length > 0 && (
        <Box sx={{ marginTop: 2 }} data-testid="outreach-candidates">
          <Typography variant="body2" sx={{ marginBottom: 1 }}>
            {selected.size} of {candidates.length} venues selected
          </Typography>
          {candidates.map((c) => (
            <FormControlLabel
              key={c._id}
              sx={{ display: 'block' }}
              control={(
                <Checkbox checked={selected.has(c._id)} onChange={() => toggle(c._id)}
                  aria-label={c.name} data-testid={`outreach-cb-${c._id}`} />
              )}
              label={candidateLabel(c)} />
          ))}
          <Box sx={{ marginTop: 1 }}>
            <Button variant="contained" onClick={openDialog}
              disabled={selected.size === 0} data-testid="outreach-open-dialog">
              Batch Outreach
            </Button>
          </Box>
        </Box>
      )}

      {result && (
        <Box sx={{ marginTop: 2 }} data-testid="outreach-result">
          <Divider sx={{ marginBottom: 1 }} />
          <Typography variant="body2">
            Sent {result.sent} of {result.requested}. Skipped {result.skipped.length}.
          </Typography>
          {result.skipped.map((s) => (
            <Typography key={s.venueId} variant="caption" sx={{ display: 'block' }} color="text.secondary">
              {s.venueId}: {s.reason}
            </Typography>
          ))}
        </Box>
      )}

      <OutreachDialog
        open={dialogOpen}
        candidates={candidates}
        selected={selected}
        targetDates={targetDates}
        bookingPeriod={bookingPeriod}
        previews={previews}
        previewLoading={previewLoading}
        previewError={previewError}
        sending={sending}
        onSend={send}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
    </LocalizationProvider>
  );
}
