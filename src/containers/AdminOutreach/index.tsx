import {
  useCallback, useContext, useEffect, useState,
} from 'react';
  Box, Typography, TextField, Button, Checkbox, FormControlLabel,
  Switch, Divider,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthContext } from 'src/providers/Auth.provider';
import outreachUtils, { type Icandidate, type IbatchResult, type IpitchPreview } from './outreach.utils';
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

  const loadConfig = useCallback(async () => {
    try {
      const cfg = await outreachUtils.getConfig(auth.token);
      setAutoApprove(cfg.autoApprove);
    } catch { /* non-blocking — leave the toggle off */ }
  }, [auth.token]);

  useEffect(() => { if (isAuthorized) void loadConfig(); }, [isAuthorized, loadConfig]);

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
          slotProps={{
            textField: {
              size: 'small',
              'data-testid': 'outreach-structured-date',
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
