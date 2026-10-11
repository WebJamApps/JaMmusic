import React, {
  useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import {
  Box, Typography, Button, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Collapse, Chip,
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import { AuthContext } from 'src/providers/Auth.provider';
import adminDatabaseUtils, {
  type BackupRunSummary,
} from './admin-database.utils';
import { RestoreDialog } from './RestoreDialog';
import { CopyToDevDialog } from './CopyToDevDialog';

export function RunRow({ run }: { run: BackupRunSummary }) {
  const [open, setOpen] = useState(false);
  const counts = adminDatabaseUtils.computeTotalCounts(run);
  const formattedTime = adminDatabaseUtils.formatRunTime(run.startTime || run.startedAt || run.name);
  const stateColor = run.state === 'good' ? 'success' : run.state === 'failed' ? 'error' : 'warning';
  const dbEntries = Object.entries(run.collections || {});

  return (
    <>
      <TableRow data-testid={`backup-run-row-${run.name}`} sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            data-testid={`backup-run-expand-${run.name}`}
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell data-testid={`run-time-${run.name}`}>{formattedTime}</TableCell>
        <TableCell data-testid={`run-trigger-${run.name}`}>{run.trigger || '—'}</TableCell>
        <TableCell data-testid={`run-state-${run.name}`}>
          <Chip label={run.state} color={stateColor} size="small" />
        </TableCell>
        <TableCell data-testid={`run-size-${run.name}`}>
          {adminDatabaseUtils.formatRunSize(run.size)}
        </TableCell>
        <TableCell data-testid={`run-counts-${run.name}`}>
          {`${counts.totalRecords.toLocaleString()} records across ${counts.totalCollections} collection${counts.totalCollections === 1 ? '' : 's'}`}
        </TableCell>
        <TableCell data-testid={`run-path-${run.name}`}>{run.dropboxPath || run.path || '—'}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }} data-testid={`backup-run-details-${run.name}`}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Databases & Collections
              </Typography>
              {dbEntries.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No collection details recorded
                </Typography>
              ) : (
                dbEntries.map(([dbName, collMap]) => {
                  const collEntries = Object.entries(collMap || {});
                  return (
                    <Box key={dbName} sx={{ marginBottom: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Database: {dbName}
                      </Typography>
                      {collEntries.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No collections in this database
                        </Typography>
                      ) : (
                        <Table size="small" aria-label={`collections for ${dbName}`} sx={{ maxWidth: 600, mt: 1 }}>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Collection</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Records</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {collEntries.map(([collName, recordCount]) => (
                              <TableRow key={collName}>
                                <TableCell>{collName}</TableCell>
                                <TableCell align="right">
                                  {typeof recordCount === 'number' ? recordCount.toLocaleString() : recordCount}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </Box>
                  );
                })
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export function AdminDatabase({ pollInterval = 1000 }: { pollInterval?: number } = {}) {
  const { auth } = useContext(AuthContext);
  const allowed = adminDatabaseUtils.getAllowedAdminRoles();
  const isAuthorized = auth.isAuthenticated && allowed.includes(auth.user.userType);

  const [runs, setRuns] = useState<BackupRunSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupResult, setBackupResult] = useState<{ severity: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [activeOpName, setActiveOpName] = useState<string | null>(null);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [copyToDevOpen, setCopyToDevOpen] = useState(false);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!isAuthorized) return;
    setLoading(true);
    setError('');
    try {
      const data = await adminDatabaseUtils.listRuns(auth.token);
      if (!isMountedRef.current) return;
      setRuns(data);
    } catch (e) {
      if (!isMountedRef.current) return;
      const err = e as { message?: string };
      setError(err.message || 'Failed to load backup runs');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [auth.token, isAuthorized]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!isAuthorized) {
      setActiveOpName(null);
      setBackupLoading(false);
    }
  }, [isAuthorized]);

  useEffect(() => {
    if (!activeOpName || !isAuthorized) return undefined;

    let isCancelled = false;
    let timerId: NodeJS.Timeout | null = null;

    const poll = async () => {
      try {
        const op = await adminDatabaseUtils.getOperation(auth.token, activeOpName);
        if (isCancelled) return;

        if (op.status === 'completed') {
          setActiveOpName(null);
          setBackupLoading(false);
          setBackupResult({
            severity: 'success',
            message: 'Backup completed successfully',
          });
          void refresh();
        } else if (op.status === 'failed') {
          setActiveOpName(null);
          setBackupLoading(false);
          setBackupResult({
            severity: 'error',
            message: op.error || 'Backup failed',
          });
          void refresh();
        } else {
          timerId = setTimeout(() => {
            void poll();
          }, pollInterval);
        }
      } catch (pollErr) {
        if (isCancelled) return;
        setActiveOpName(null);
        setBackupLoading(false);
        setBackupResult({
          severity: 'error',
          message: (pollErr as Error).message || 'Failed to check backup progress',
        });
        void refresh();
      }
    };

    timerId = setTimeout(() => {
      void poll();
    }, pollInterval);

    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [activeOpName, isAuthorized, auth.token, pollInterval, refresh]);

  const handleStartBackup = async () => {
    setBackupLoading(true);
    setBackupResult(null);
    try {
      const res = await adminDatabaseUtils.startBackup(auth.token);
      if (!isMountedRef.current) return;
      setActiveOpName(res.name);
    } catch (e) {
      if (!isMountedRef.current) return;
      const err = e as { message?: string };
      setBackupResult({
        severity: 'error',
        message: err.message || 'Failed to start backup',
      });
      setBackupLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <Box sx={{ padding: 3 }} data-testid="admin-database-unauthorized">
        <Typography variant="h6">Not authorized</Typography>
        <Typography variant="body2">You must be signed in as a top-level admin to view this page.</Typography>
      </Box>
    );
  }

  const newestGoodRunInfo = adminDatabaseUtils.computeNewestGoodRun(runs);
  const mostRecentResult = adminDatabaseUtils.getMostRecentRunResult(runs);

  return (
    <Box
      sx={{
        padding: 3, maxWidth: 1200, margin: 'auto', width: '100%', minWidth: 0,
      }}
      data-testid="admin-database-page"
    >
      <Typography variant="h5" sx={{ marginBottom: 2 }}>Admin Database</Typography>

      <Box
        data-testid="admin-database-status"
        sx={{
          marginBottom: 3, padding: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider',
        }}
      >
        <Typography variant="body1">
          {'Newest good run age: '}
          <Typography
            component="span"
            data-testid="newest-good-run-age"
            style={{ color: newestGoodRunInfo.isRed ? '#d32f2f' : 'inherit', fontWeight: 'bold' }}
            sx={{
              color: newestGoodRunInfo.isRed ? 'error.main' : 'text.primary',
              fontWeight: 'bold',
            }}
          >
            {newestGoodRunInfo.ageText}
          </Typography>
          {' | Result of most recent run: '}
          <Typography
            component="span"
            data-testid="most-recent-run-result"
            sx={{ fontWeight: 'bold' }}
          >
            {mostRecentResult}
          </Typography>
        </Typography>
      </Box>

      <Box sx={{ marginBottom: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          data-testid="backup-now-button"
          onClick={() => { void handleStartBackup(); }}
          disabled={backupLoading || loading}
        >
          Back up now
        </Button>
        <Button
          variant="outlined"
          color="primary"
          data-testid="restore-button"
          onClick={() => setRestoreOpen(true)}
          disabled={backupLoading || loading}
        >
          Restore
        </Button>
        <Button
          variant="outlined"
          color="primary"
          data-testid="copy-to-dev-button"
          onClick={() => setCopyToDevOpen(true)}
          disabled={backupLoading || loading}
        >
          Copy production into DEV
        </Button>
        {backupLoading && (
          <Box data-testid="backup-in-progress" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Backup in progress...</Typography>
          </Box>
        )}
      </Box>

      {backupResult && (
        <Alert
          severity={backupResult.severity}
          data-testid="backup-result"
          sx={{ marginBottom: 3 }}
          onClose={() => setBackupResult(null)}
        >
          {backupResult.message}
        </Alert>
      )}

      {loading && <Typography data-testid="admin-database-loading" sx={{ marginBottom: 2 }}>Loading...</Typography>}
      {error && (
        <Alert severity="error" data-testid="admin-database-error" sx={{ marginBottom: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} data-testid="backup-runs-table">
        <Table aria-label="backup runs table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 48 }} />
              <TableCell>When it ran</TableCell>
              <TableCell>Trigger</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Counts</TableCell>
              <TableCell>Dropbox path</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {runs.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No backup runs found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              runs.map((run) => (
                <RunRow key={run.name} run={run} />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <RestoreDialog
        open={restoreOpen}
        runs={runs}
        token={auth.token}
        onClose={() => setRestoreOpen(false)}
        onComplete={() => { void refresh(); }}
        pollInterval={pollInterval}
      />

      <CopyToDevDialog
        open={copyToDevOpen}
        runs={runs}
        token={auth.token}
        onClose={() => setCopyToDevOpen(false)}
        onComplete={() => { void refresh(); }}
        pollInterval={pollInterval}
      />
    </Box>
  );
}

export default AdminDatabase;
