import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import adminDatabaseUtils, {
  type BackupRunSummary,
  type RestoreResult,
} from './admin-database.utils';

export interface RestoreDialogProps {
  open: boolean;
  runs: BackupRunSummary[];
  token: string;
  onClose: () => void;
  onComplete?: () => void;
  pollInterval?: number;
}

export function RestoreDialog({
  open,
  runs,
  token,
  onClose,
  onComplete,
  pollInterval = 1000,
}: RestoreDialogProps) {
  const goodRuns = runs.filter((r) => r.state === 'good');

  const [selectedRunName, setSelectedRunName] = useState<string>(goodRuns[0]?.name || '');
  const [typedDate, setTypedDate] = useState<string>('');
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [activeOpName, setActiveOpName] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState<string>('');
  const [result, setResult] = useState<RestoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const prevOpenRef = React.useRef(false);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      const firstGood = runs.find((r) => r.state === 'good');
      setSelectedRunName(firstGood?.name || '');
      setTypedDate('');
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
  const expectedDate = adminDatabaseUtils.getRunDate(selectedRun);
  const isDateMatched = expectedDate.length > 0 && typedDate.trim() === expectedDate;

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
          setResult((op.result as RestoreResult) || { collections: [], missingIndexes: [], indexFailures: [] });
          onComplete?.();
        } else if (op.status === 'failed') {
          setActiveOpName(null);
          setInProgress(false);
          setError(op.error || 'Restore failed');
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
        setError((pollErr as Error).message || 'Failed to check restore progress');
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

  const handleStartRestore = async () => {
    if (!selectedRun || !isDateMatched) return;
    setInProgress(true);
    setError(null);
    setResult(null);
    try {
      const res = await adminDatabaseUtils.startRestore(token, selectedRun.name, typedDate.trim());
      setActiveOpName(res.name);
      setProgressStep('starting');
    } catch (e) {
      setError((e as Error).message || 'Failed to start restore');
      setInProgress(false);
    }
  };

  return (
    <Dialog open={open} onClose={inProgress ? undefined : onClose} fullWidth maxWidth="md" data-testid="restore-dialog">
      <DialogTitle>Restore Production from Backup</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Restoring production replaces production collections with the chosen backup.
          A fresh backup of production is taken first before any data is replaced.
        </Typography>

        {error && (
          <Alert severity="error" data-testid="restore-error-alert" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Alert severity="success" data-testid="restore-success-alert" sx={{ mb: 2 }}>
            Restore completed successfully
          </Alert>
        )}

        {!result && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="restore-run-select-label">Backup Run (Good Runs Only)</InputLabel>
              <Select
                labelId="restore-run-select-label"
                id="restore-run-select"
                data-testid="restore-run-select"
                value={selectedRunName}
                label="Backup Run (Good Runs Only)"
                onChange={(e) => {
                  setSelectedRunName(e.target.value);
                  setTypedDate('');
                }}
                disabled={inProgress || goodRuns.length === 0}
              >
                {goodRuns.length === 0 ? (
                  <MenuItem value="" disabled>No good backup runs available</MenuItem>
                ) : (
                  goodRuns.map((r) => (
                    <MenuItem key={r.name} value={r.name} data-testid={`restore-run-option-${r.name}`}>
                      {`${adminDatabaseUtils.formatRunTime(r.startTime || r.startedAt || r.name)} (${r.name})`}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {selectedRun && (
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {'To confirm restore, type the backup run date ('}
                  <strong>{expectedDate}</strong>
                  {'):'}
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  label="Run date (YYYY-MM-DD)"
                  data-testid="restore-date-input"
                  placeholder={expectedDate}
                  value={typedDate}
                  onChange={(e) => setTypedDate(e.target.value)}
                  disabled={inProgress}
                />
                {typedDate.length > 0 && !isDateMatched && (
                  <Typography variant="caption" color="error" data-testid="restore-date-helper-text" sx={{ display: 'block', mt: 0.5 }}>
                    {`Date does not match '${expectedDate}'`}
                  </Typography>
                )}
              </Box>
            )}

            {inProgress && (
              <Box data-testid="restore-in-progress" sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">
                  Restore in progress
                  {progressStep ? `: ${progressStep}` : '...'}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {result && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Restored Collections vs Manifest
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small" aria-label="restored collections table" data-testid="restore-collections-table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Collection</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Restored Records</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Manifest Records</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.collections.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">No collections restored</TableCell>
                    </TableRow>
                  ) : (
                    result.collections.map((c) => (
                      <TableRow key={c.collection} data-testid={`restore-collection-row-${c.collection}`}>
                        <TableCell>{c.collection}</TableCell>
                        <TableCell align="right" data-testid={`restore-count-${c.collection}`}>
                          {c.restored.toLocaleString()}
                        </TableCell>
                        <TableCell align="right" data-testid={`restore-manifest-${c.collection}`}>
                          {c.manifest !== null ? c.manifest.toLocaleString() : '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {result.missingIndexes && result.missingIndexes.length > 0 && (
              <Box data-testid="restore-missing-indexes" sx={{ mt: 2 }}>
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
              <Box data-testid="restore-index-failures" sx={{ mt: 2 }}>
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
        <Button onClick={onClose} disabled={inProgress} data-testid="restore-dialog-close">
          {result ? 'Close' : 'Cancel'}
        </Button>
        {!result && (
          <Button
            variant="contained"
            color="error"
            onClick={() => { void handleStartRestore(); }}
            disabled={!selectedRun || !isDateMatched || inProgress}
            data-testid="restore-submit-button"
          >
            Restore
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default RestoreDialog;
