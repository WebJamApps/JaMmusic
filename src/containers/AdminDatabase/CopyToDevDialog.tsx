import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import adminDatabaseUtils, {
  type BackupRunSummary,
  type CopyResult,
} from './admin-database.utils';

export interface CopyToDevDialogProps {
  open: boolean;
  runs: BackupRunSummary[];
  token: string;
  onClose: () => void;
  onComplete?: () => void;
  pollInterval?: number;
}

export function CopyToDevDialog({
  open,
  runs,
  token,
  onClose,
  onComplete,
  pollInterval = 1000,
}: CopyToDevDialogProps) {
  const goodRuns = runs.filter((r) => r.state === 'good');

  const [selectedRunName, setSelectedRunName] = useState<string>(goodRuns[0]?.name || '');
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [activeOpName, setActiveOpName] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState<string>('');
  const [result, setResult] = useState<CopyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const prevOpenRef = React.useRef(false);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      const firstGood = runs.find((r) => r.state === 'good');
      setSelectedRunName(firstGood?.name || '');
      setInProgress(false);
      setActiveOpName(null);
      setProgressStep('');
      setResult(null);
      setError(null);
    }
    prevOpenRef.current = open;
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open && !selectedRunName && goodRuns.length > 0) {
      setSelectedRunName(goodRuns[0].name);
    }
  }, [open, selectedRunName, goodRuns]);

  const selectedRun = goodRuns.find((r) => r.name === selectedRunName) || null;

  useEffect(() => {
    if (!activeOpName || !open) return undefined;

    let isCancelled = false;
    let timerId: NodeJS.Timeout | null = null;

    const poll = async () => {
      try {
        const op = await adminDatabaseUtils.getOperation(token, activeOpName);
        if (isCancelled) return;

        if (op.status === 'completed') {
          setActiveOpName(null);
          setInProgress(false);
          setResult((op.result as CopyResult) || {
            collections: [],
            missingIndexes: [],
            indexFailures: [],
            readBack: { status: 'none', remaining: 0, message: 'clean' },
            clean: true,
          });
          onComplete?.();
        } else if (op.status === 'failed') {
          setActiveOpName(null);
          setInProgress(false);
          setError(op.error || 'Copy to DEV failed');
          onComplete?.();
        } else {
          setProgressStep(op.progress || 'in progress');
          timerId = setTimeout(() => {
            void poll();
          }, pollInterval);
        }
      } catch (pollErr) {
        if (isCancelled) return;
        setActiveOpName(null);
        setInProgress(false);
        setError((pollErr as Error).message || 'Failed to check copy progress');
        onComplete?.();
      }
    };

    timerId = setTimeout(() => {
      void poll();
    }, pollInterval);

    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [activeOpName, open, token, pollInterval, onComplete]);

  const handleStartCopy = async () => {
    if (!selectedRun) return;
    setInProgress(true);
    setError(null);
    setResult(null);
    try {
      const res = await adminDatabaseUtils.startCopyToDev(token, selectedRun.name);
      setActiveOpName(res.name);
      setProgressStep('starting');
    } catch (e) {
      setError((e as Error).message || 'Failed to start copy to DEV');
      setInProgress(false);
    }
  };

  const totalAddressesReplaced = result?.collections.reduce(
    (sum, c) => sum + (c.addressesReplaced || 0),
    0,
  ) ?? 0;

  return (
    <Dialog open={open} onClose={inProgress ? undefined : onClose} fullWidth maxWidth="md" data-testid="copy-to-dev-dialog">
      <DialogTitle>Copy Production into DEV</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Copies the chosen backup into the DEV database, replacing every personal email address
          with an undeliverable address and blanking Facebook page tokens on the way in.
        </Typography>

        {error && (
          <Alert severity="error" data-testid="copy-to-dev-error-alert" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Alert severity={result.clean ? 'success' : 'warning'} data-testid="copy-to-dev-success-alert" sx={{ mb: 2 }}>
            {result.clean ? 'Copy to DEV completed successfully' : 'Copy to DEV finished with warnings'}
          </Alert>
        )}

        {!result && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="copy-to-dev-run-select-label">Backup Run (Good Runs Only)</InputLabel>
              <Select
                labelId="copy-to-dev-run-select-label"
                id="copy-to-dev-run-select"
                data-testid="copy-to-dev-run-select"
                value={selectedRunName}
                label="Backup Run (Good Runs Only)"
                onChange={(e) => setSelectedRunName(e.target.value)}
                disabled={inProgress || goodRuns.length === 0}
              >
                {goodRuns.length === 0 ? (
                  <MenuItem value="" disabled>No good backup runs available</MenuItem>
                ) : (
                  goodRuns.map((r) => (
                    <MenuItem key={r.name} value={r.name} data-testid={`copy-run-option-${r.name}`}>
                      {`${adminDatabaseUtils.formatRunTime(r.startTime || r.startedAt || r.name)} (${r.name})`}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {inProgress && (
              <Box data-testid="copy-to-dev-in-progress" sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">
                  Copy in progress
                  {progressStep ? `: ${progressStep}` : '...'}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {result && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2" data-testid="copy-total-addresses-replaced">
                {'Total email addresses replaced: '}
                <strong>{totalAddressesReplaced.toLocaleString()}</strong>
              </Typography>
              <Typography variant="body2" data-testid="copy-read-back-result">
                {'Read-back check: '}
                <strong>{result.readBack?.message || (result.clean ? 'clean' : 'failed')}</strong>
              </Typography>
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Copied Collections vs Manifest
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small" aria-label="copied collections table" data-testid="copy-collections-table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Collection</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Copied Records</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Manifest Records</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Addresses Replaced</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.collections.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No collections copied</TableCell>
                    </TableRow>
                  ) : (
                    result.collections.map((c) => (
                      <TableRow key={c.collection} data-testid={`copy-collection-row-${c.collection}`}>
                        <TableCell>{c.collection}</TableCell>
                        <TableCell align="right" data-testid={`copy-count-${c.collection}`}>
                          {c.copied.toLocaleString()}
                        </TableCell>
                        <TableCell align="right" data-testid={`copy-manifest-${c.collection}`}>
                          {c.manifest !== null ? c.manifest.toLocaleString() : '—'}
                        </TableCell>
                        <TableCell align="right" data-testid={`copy-replaced-${c.collection}`}>
                          {c.addressesReplaced.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {result.missingIndexes && result.missingIndexes.length > 0 && (
              <Box data-testid="copy-missing-indexes" sx={{ mt: 2 }}>
                <Typography variant="caption" color="warning.main" sx={{ fontWeight: 'bold' }}>
                  Missing Indexes:
                </Typography>
                {result.missingIndexes.map((idx) => (
                  <Typography key={`${idx.collection}-${idx.index}`} variant="body2" color="text.secondary">
                    {`${idx.collection}: ${idx.index}`}
                  </Typography>
                ))}
              </Box>
            )}

            {result.indexFailures && result.indexFailures.length > 0 && (
              <Box data-testid="copy-index-failures" sx={{ mt: 2 }}>
                <Typography variant="caption" color="error.main" sx={{ fontWeight: 'bold' }}>
                  Index Failures:
                </Typography>
                {result.indexFailures.map((fail) => (
                  <Typography key={`${fail.collection}-${fail.message}`} variant="body2" color="error.main">
                    {`${fail.collection}: ${fail.message}`}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={inProgress} data-testid="copy-to-dev-dialog-close">
          {result ? 'Close' : 'Cancel'}
        </Button>
        {!result && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => { void handleStartCopy(); }}
            disabled={!selectedRun || inProgress}
            data-testid="copy-to-dev-submit-button"
          >
            Copy into DEV
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default CopyToDevDialog;
