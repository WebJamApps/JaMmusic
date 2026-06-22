import { useCallback, useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Button, Checkbox, FormControlLabel, Switch, Divider,
} from '@mui/material';
import adminVenuesUtils, { type Icandidate, type IbatchResult } from './admin-venues.utils';

interface IbatchApprovalProps { token: string }

function candidateLabel(c: Icandidate): string {
  const city = c.city ? ` (${c.city})` : '';
  const type = c.venueType ? ` — ${c.venueType}` : '';
  return `${c.name}${city}${type}`;
}

export function BatchApproval({ token }: IbatchApprovalProps) {
  const [targetDates, setTargetDates] = useState('');
  const [bookingPeriod, setBookingPeriod] = useState('');
  const [candidates, setCandidates] = useState<Icandidate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<IbatchResult | null>(null);
  const [autoApprove, setAutoApprove] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadConfig = useCallback(async () => {
    try {
      const cfg = await adminVenuesUtils.getConfig(token);
      setAutoApprove(cfg.autoApprove);
    } catch { /* non-blocking — leave the toggle off */ }
  }, [token]);

  useEffect(() => { void loadConfig(); }, [loadConfig]);

  const loadCandidates = async () => {
    if (!targetDates.trim()) { setError('Enter target dates first'); return; }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await adminVenuesUtils.getCandidates(token, targetDates.trim());
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

  const send = async () => {
    if (selected.size === 0) { setError('Select at least one venue'); return; }
    setSending(true);
    setError('');
    try {
      const res = await adminVenuesUtils.sendBatch(token, {
        venueIds: [...selected], targetDates: targetDates.trim(), bookingPeriod: bookingPeriod.trim() || undefined,
      });
      setResult(res);
      setCandidates([]);
      setSelected(new Set());
    } catch (e) {
      setError((e as { message?: string }).message || 'Batch send failed');
    } finally {
      setSending(false);
    }
  };

  const toggleAutoApprove = async (value: boolean) => {
    setError('');
    try {
      const cfg = await adminVenuesUtils.setConfig(token, value);
      setAutoApprove(cfg.autoApprove);
    } catch (e) {
      setError((e as { message?: string }).message || 'Failed to update auto-approve');
    }
  };

  const pitchWord = selected.size === 1 ? 'pitch' : 'pitches';
  const sendLabel = sending ? 'Sending...' : `Send ${selected.size} ${pitchWord}`;

  return (
    <Box data-testid="batch-approval" sx={{ marginTop: 4 }}>
      <Typography variant="h6" sx={{ marginBottom: 1 }}>Batch outreach</Typography>
      <FormControlLabel
        control={(
          <Switch checked={autoApprove} onChange={(e) => toggleAutoApprove(e.target.checked)}
            aria-label="auto-approve" data-testid="auto-approve-toggle" />
        )}
        label="Auto-approve (let the AI agent send batches without review)" />
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginTop: 1 }}>
        <TextField label="Target dates" value={targetDates} onChange={(e) => setTargetDates(e.target.value)}
          placeholder="e.g. the weekend of Aug 14-16" data-testid="batch-target-dates" />
        <TextField label="Booking period" value={bookingPeriod} onChange={(e) => setBookingPeriod(e.target.value)}
          placeholder="e.g. August" data-testid="batch-booking-period" />
        <Button variant="outlined" onClick={loadCandidates} disabled={loading} data-testid="batch-load">
          {loading ? 'Loading...' : 'Propose target list'}
        </Button>
      </Box>

      {error && <Typography color="error" sx={{ marginTop: 1 }} data-testid="batch-error">{error}</Typography>}

      {candidates.length > 0 && (
        <Box sx={{ marginTop: 2 }} data-testid="batch-candidates">
          <Typography variant="body2" sx={{ marginBottom: 1 }}>
            {selected.size} of {candidates.length} venues selected
          </Typography>
          {candidates.map((c) => (
            <FormControlLabel
              key={c._id}
              sx={{ display: 'block' }}
              control={(
                <Checkbox checked={selected.has(c._id)} onChange={() => toggle(c._id)}
                  aria-label={c.name} data-testid={`batch-cb-${c._id}`} />
              )}
              label={candidateLabel(c)} />
          ))}
          <Box sx={{ marginTop: 1 }}>
            <Button variant="contained" onClick={send} disabled={sending || selected.size === 0} data-testid="batch-send">
              {sendLabel}
            </Button>
          </Box>
        </Box>
      )}

      {result && (
        <Box sx={{ marginTop: 2 }} data-testid="batch-result">
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
    </Box>
  );
}
