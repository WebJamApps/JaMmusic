/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  render, screen, fireEvent, waitFor, act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthContext, defaultAuth } from 'src/providers/Auth.provider';
import { AdminDatabase, RunRow } from 'src/containers/AdminDatabase';
import adminDatabaseUtils, {
  type BackupRunSummary,
  type BackupOperation,
  type CopyResult,
} from 'src/containers/AdminDatabase/admin-database.utils';

describe('admin-database.utils', () => {
  it('getAllowedAdminRoles returns [Developer]', () => {
    expect(adminDatabaseUtils.getAllowedAdminRoles()).toEqual(['Developer']);
  });

  describe('API calls', () => {
    const mockToken = 'mock-jwt-token';

    it('listRuns returns runs on success', async () => {
      const mockRuns: BackupRunSummary[] = [
        {
          name: '2026-10-10T12-00-00-000Z',
          startTime: '2026-10-10T12:00:00.000Z',
          startedAt: '2026-10-10T12:00:00.000Z',
          trigger: 'daily check',
          state: 'good',
          size: 1024,
          dropboxPath: '/webjam-backups/2026-10-10T12-00-00-000Z',
          path: '/webjam-backups/2026-10-10T12-00-00-000Z',
          collections: { webjamsalem: { users: 5 } },
          databases: { webjamsalem: { ok: true, collections: { users: 5 } } },
        },
      ];
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockRuns,
      } as Response);

      const res = await adminDatabaseUtils.listRuns(mockToken);
      expect(res).toEqual(mockRuns);
    });

    it('listRuns throws error when !res.ok', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(adminDatabaseUtils.listRuns(mockToken)).rejects.toThrow('500 Internal Server Error');
    });

    it('startBackup returns response on success', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: '2026-10-11T12-00-00-000Z', message: 'backup started' }),
      } as Response);

      const res = await adminDatabaseUtils.startBackup(mockToken);
      expect(res).toEqual({ name: '2026-10-11T12-00-00-000Z', message: 'backup started' });
    });

    it('startBackup throws error when !res.ok', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 409,
        statusText: 'Conflict',
      } as Response);

      await expect(adminDatabaseUtils.startBackup(mockToken)).rejects.toThrow('409 Conflict');
    });

    it('getOperation returns operation status on success', async () => {
      const mockOp: BackupOperation = {
        name: '2026-10-11T12-00-00-000Z',
        type: 'backup',
        status: 'completed',
        startedAt: '2026-10-11T12:00:00.000Z',
        finishedAt: '2026-10-11T12:00:20.000Z',
        progress: 'complete',
      };
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockOp,
      } as Response);

      const res = await adminDatabaseUtils.getOperation(mockToken, '2026-10-11T12-00-00-000Z');
      expect(res).toEqual(mockOp);
    });

    it('getOperation throws error when !res.ok', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(adminDatabaseUtils.getOperation(mockToken, 'op-name')).rejects.toThrow('404 Not Found');
    });

    it('startRestore posts date and returns response on success', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'restore-123', message: 'restore started' }),
      } as Response);

      const res = await adminDatabaseUtils.startRestore(mockToken, 'run-1', '2026-10-10');
      expect(res).toEqual({ name: 'restore-123', message: 'restore started' });
    });

    it('startRestore throws error when !res.ok', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'typed date does not match chosen run' }),
      } as Response);

      await expect(adminDatabaseUtils.startRestore(mockToken, 'run-1', '2026-10-11')).rejects.toThrow(
        'typed date does not match chosen run',
      );
    });

    it('startCopyToDev returns response on success', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'copy-123', message: 'copy to DEV started' }),
      } as Response);

      const res = await adminDatabaseUtils.startCopyToDev(mockToken, 'run-1');
      expect(res).toEqual({ name: 'copy-123', message: 'copy to DEV started' });
    });

    it('startCopyToDev throws error when !res.ok', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'DEV_MONGO_DB_URI is required' }),
      } as Response);

      await expect(adminDatabaseUtils.startCopyToDev(mockToken, 'run-1')).rejects.toThrow(
        'DEV_MONGO_DB_URI is required',
      );
    });
  });

  describe('getRunDate', () => {
    const baseRunFixture: BackupRunSummary = {
      name: '2026-10-08T05-00-00-000Z',
      startTime: null,
      startedAt: null,
      trigger: 'daily',
      state: 'good',
      size: 1024,
      dropboxPath: '/webjam-backups/run',
      path: '/webjam-backups/run',
      collections: {},
      databases: {},
    };

    it('returns empty string when run is null or undefined', () => {
      expect(adminDatabaseUtils.getRunDate(null)).toBe('');
      expect(adminDatabaseUtils.getRunDate(undefined)).toBe('');
    });

    it('returns first 10 characters of startTime, startedAt, or name', () => {
      expect(adminDatabaseUtils.getRunDate({ ...baseRunFixture, startTime: '2026-10-10T12:00:00.000Z' })).toBe('2026-10-10');
      expect(adminDatabaseUtils.getRunDate({ ...baseRunFixture, startedAt: '2026-10-09T08:00:00.000Z' })).toBe('2026-10-09');
      expect(adminDatabaseUtils.getRunDate(baseRunFixture)).toBe('2026-10-08');
    });
  });

  describe('isValidCopyResult', () => {
    const validCopy: CopyResult = {
      collections: [{
        collection: 'users', copied: 1, manifest: 1, addressesReplaced: 1,
      }],
      missingIndexes: [],
      indexFailures: [],
      readBack: { status: 'none', remaining: 0, message: 'clean' },
      clean: true,
    };

    it('returns true for valid CopyResult object', () => {
      expect(adminDatabaseUtils.isValidCopyResult(validCopy)).toBe(true);
    });

    it('returns false for null, undefined, and non-object values', () => {
      expect(adminDatabaseUtils.isValidCopyResult(null)).toBe(false);
      expect(adminDatabaseUtils.isValidCopyResult(undefined)).toBe(false);
      expect(adminDatabaseUtils.isValidCopyResult('not-an-object')).toBe(false);
      expect(adminDatabaseUtils.isValidCopyResult(123)).toBe(false);
    });

    it('returns false when collections is not an array', () => {
      expect(adminDatabaseUtils.isValidCopyResult({ ...validCopy, collections: null as unknown as [] })).toBe(false);
    });

    it('returns false when clean is not a boolean', () => {
      expect(adminDatabaseUtils.isValidCopyResult({ ...validCopy, clean: null as unknown as boolean })).toBe(false);
    });

    it('returns false when readBack is missing or invalid', () => {
      expect(adminDatabaseUtils.isValidCopyResult({ ...validCopy, readBack: null as unknown as CopyResult['readBack'] })).toBe(false);
      expect(adminDatabaseUtils.isValidCopyResult({
        ...validCopy,
        readBack: { status: 'invalid-status' as unknown as 'none', remaining: 0, message: 'test' },
      })).toBe(false);
      expect(adminDatabaseUtils.isValidCopyResult({
        ...validCopy,
        readBack: { status: 'none', remaining: 0, message: 123 as unknown as string },
      })).toBe(false);
    });

    it('accepts valid readBack statuses (none, found, failed)', () => {
      expect(adminDatabaseUtils.isValidCopyResult({
        ...validCopy,
        clean: false,
        readBack: { status: 'found', remaining: 2, message: 'found 2' },
      })).toBe(true);
      expect(adminDatabaseUtils.isValidCopyResult({
        ...validCopy,
        clean: false,
        readBack: { status: 'failed', remaining: null, message: 'failed' },
      })).toBe(true);
    });
  });

  describe('isValidRestoreResult', () => {
    it('returns true for valid RestoreResult with collections array', () => {
      expect(adminDatabaseUtils.isValidRestoreResult({ collections: [], missingIndexes: [], indexFailures: [] })).toBe(true);
    });

    it('returns false for null, undefined, and invalid shapes', () => {
      expect(adminDatabaseUtils.isValidRestoreResult(null)).toBe(false);
      expect(adminDatabaseUtils.isValidRestoreResult(undefined)).toBe(false);
      expect(adminDatabaseUtils.isValidRestoreResult({})).toBe(false);
      expect(adminDatabaseUtils.isValidRestoreResult({ collections: null })).toBe(false);
    });
  });

  describe('formatAge', () => {
    it('handles negative age (clock skew)', () => {
      expect(adminDatabaseUtils.formatAge(-100)).toBe('just now');
    });

    it('handles 0 ms', () => {
      expect(adminDatabaseUtils.formatAge(0)).toBe('just now');
    });

    it('handles minutes under an hour', () => {
      expect(adminDatabaseUtils.formatAge(60 * 1000)).toBe('1 minute ago');
      expect(adminDatabaseUtils.formatAge(15 * 60 * 1000)).toBe('15 minutes ago');
    });

    it('handles hours under 24 hours', () => {
      expect(adminDatabaseUtils.formatAge(60 * 60 * 1000)).toBe('1 hour ago');
      expect(adminDatabaseUtils.formatAge(5 * 60 * 60 * 1000)).toBe('5 hours ago');
    });

    it('handles exact days', () => {
      expect(adminDatabaseUtils.formatAge(24 * 60 * 60 * 1000)).toBe('1 day ago');
      expect(adminDatabaseUtils.formatAge(48 * 60 * 60 * 1000)).toBe('2 days ago');
    });

    it('handles days and hours', () => {
      expect(adminDatabaseUtils.formatAge(25 * 60 * 60 * 1000)).toBe('1 day, 1 hour ago');
      expect(adminDatabaseUtils.formatAge(26 * 60 * 60 * 1000)).toBe('1 day, 2 hours ago');
    });
  });

  describe('computeNewestGoodRun', () => {
    it('returns isRed: true and ageText: none when runs array is empty', () => {
      const res = adminDatabaseUtils.computeNewestGoodRun([]);
      expect(res).toEqual({
        newestGoodRun: null,
        ageMs: null,
        ageText: 'none',
        isRed: true,
      });
    });

    it('returns isRed: true and ageText: none when no run is good', () => {
      const runs: BackupRunSummary[] = [
        {
          name: 'run-1',
          startTime: '2026-10-11T00:00:00.000Z',
          startedAt: '2026-10-11T00:00:00.000Z',
          trigger: 'daily check',
          state: 'failed',
          size: null,
          dropboxPath: '',
          path: '',
          collections: {},
          databases: {},
        },
      ];
      const res = adminDatabaseUtils.computeNewestGoodRun(runs);
      expect(res.isRed).toBe(true);
      expect(res.ageText).toBe('none');
    });

    it('returns isRed: true when run date is invalid', () => {
      const runs: BackupRunSummary[] = [
        {
          name: 'invalid-date',
          startTime: 'invalid',
          startedAt: 'invalid',
          trigger: null,
          state: 'good',
          size: null,
          dropboxPath: '',
          path: '',
          collections: {},
          databases: {},
        },
      ];
      const res = adminDatabaseUtils.computeNewestGoodRun(runs);
      expect(res.isRed).toBe(true);
      expect(res.ageText).toBe('invalid date');
    });

    it('returns isRed: false when newest good run is <= 24 hours old', () => {
      const now = new Date('2026-10-11T12:00:00.000Z');
      const runs: BackupRunSummary[] = [
        {
          name: '2026-10-11T10-00-00-000Z',
          startTime: '2026-10-11T10:00:00.000Z',
          startedAt: '2026-10-11T10:00:00.000Z',
          trigger: 'daily check',
          state: 'good',
          size: 100,
          dropboxPath: '',
          path: '',
          collections: {},
          databases: {},
        },
      ];
      const res = adminDatabaseUtils.computeNewestGoodRun(runs, now);
      expect(res.isRed).toBe(false);
      expect(res.ageText).toBe('2 hours ago');
    });

    it('returns isRed: true when newest good run is > 24 hours old', () => {
      const now = new Date('2026-10-11T12:00:00.000Z');
      const runs: BackupRunSummary[] = [
        {
          name: '2026-10-10T10-00-00-000Z',
          startTime: '2026-10-10T10:00:00.000Z',
          startedAt: '2026-10-10T10:00:00.000Z',
          trigger: 'daily check',
          state: 'good',
          size: 100,
          dropboxPath: '',
          path: '',
          collections: {},
          databases: {},
        },
      ];
      const res = adminDatabaseUtils.computeNewestGoodRun(runs, now);
      expect(res.isRed).toBe(true);
      expect(res.ageText).toBe('1 day, 2 hours ago');
    });
  });

  describe('getMostRecentRunResult', () => {
    it('returns none when runs is empty', () => {
      expect(adminDatabaseUtils.getMostRecentRunResult([])).toBe('none');
    });

    it('returns state of first run', () => {
      const runs = [
        { state: 'failed' } as BackupRunSummary,
        { state: 'good' } as BackupRunSummary,
      ];
      expect(adminDatabaseUtils.getMostRecentRunResult(runs)).toBe('failed');
    });
  });

  describe('computeTotalCounts', () => {
    it('returns 0 for empty collections', () => {
      const run = { collections: {} } as BackupRunSummary;
      expect(adminDatabaseUtils.computeTotalCounts(run)).toEqual({ totalRecords: 0, totalCollections: 0 });
    });

    it('calculates total records and collections correctly', () => {
      const run: BackupRunSummary = {
        name: 'run-1',
        startTime: null,
        startedAt: null,
        trigger: null,
        state: 'good',
        size: null,
        dropboxPath: '',
        path: '',
        collections: {
          webjamsalem: { users: 10, gigs: 142 },
          otherdb: { songs: 37 },
        },
        databases: {},
      };
      expect(adminDatabaseUtils.computeTotalCounts(run)).toEqual({ totalRecords: 189, totalCollections: 3 });
    });
  });

  describe('formatRunTime', () => {
    it('handles empty/null dates', () => {
      expect(adminDatabaseUtils.formatRunTime(null)).toBe('—');
      expect(adminDatabaseUtils.formatRunTime('')).toBe('—');
    });

    it('handles invalid dates', () => {
      expect(adminDatabaseUtils.formatRunTime('invalid-string')).toBe('invalid-string');
    });

    it('formats valid ISO dates', () => {
      expect(adminDatabaseUtils.formatRunTime('2026-10-07T21:40:51.044Z')).toBe('2026-10-07 21:40:51');
    });
  });

  describe('formatRunSize', () => {
    it('handles empty/null/negative/NaN values', () => {
      expect(adminDatabaseUtils.formatRunSize(null)).toBe('—');
      expect(adminDatabaseUtils.formatRunSize(undefined)).toBe('—');
      expect(adminDatabaseUtils.formatRunSize(-1)).toBe('—');
      expect(adminDatabaseUtils.formatRunSize(NaN)).toBe('—');
    });

    it('formats bytes under 1024', () => {
      expect(adminDatabaseUtils.formatRunSize(0)).toBe('0 B');
      expect(adminDatabaseUtils.formatRunSize(500)).toBe('500 B');
      expect(adminDatabaseUtils.formatRunSize(1023)).toBe('1023 B');
    });

    it('formats kilobytes correctly', () => {
      expect(adminDatabaseUtils.formatRunSize(1024)).toBe('1 KB');
      expect(adminDatabaseUtils.formatRunSize(1536)).toBe('1.5 KB');
      expect(adminDatabaseUtils.formatRunSize(10240)).toBe('10 KB');
    });

    it('formats megabytes correctly', () => {
      expect(adminDatabaseUtils.formatRunSize(5800000)).toBe('5.5 MB');
      expect(adminDatabaseUtils.formatRunSize(10485760)).toBe('10 MB');
    });

    it('formats gigabytes correctly', () => {
      expect(adminDatabaseUtils.formatRunSize(1073741824)).toBe('1 GB');
    });
  });
});

describe('AdminDatabase Component', () => {
  const sampleRuns: BackupRunSummary[] = [
    {
      name: '2026-10-10T10-00-00-000Z',
      startTime: '2026-10-10T10:00:00.000Z',
      startedAt: '2026-10-10T10:00:00.000Z',
      trigger: 'daily check',
      state: 'good',
      size: 5800000,
      dropboxPath: '/webjam-backups/2026-10-10T10-00-00-000Z',
      path: '/webjam-backups/2026-10-10T10-00-00-000Z',
      collections: {
        webjamsalem: { users: 10, gigs: 142 },
      },
      databases: {
        webjamsalem: { ok: true, collections: { users: 10, gigs: 142 } },
      },
    },
    {
      name: '2026-10-09T12-00-00-000Z',
      startTime: '2026-10-09T12:00:00.000Z',
      startedAt: '2026-10-09T12:00:00.000Z',
      trigger: 'backup button',
      state: 'failed',
      size: null,
      dropboxPath: '/webjam-backups/2026-10-09T12-00-00-000Z',
      path: '/webjam-backups/2026-10-09T12-00-00-000Z',
      collections: {},
      databases: {},
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders unauthorized when user is not authenticated', () => {
    const auth = { ...defaultAuth, isAuthenticated: false };
    render(
      <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
        <AdminDatabase />
      </AuthContext.Provider>,
    );

    expect(screen.getByTestId('admin-database-unauthorized')).toBeInTheDocument();
    expect(screen.getByText('Not authorized')).toBeInTheDocument();
  });

  it('renders unauthorized when user has role other than Developer', () => {
    const auth = {
      ...defaultAuth,
      isAuthenticated: true,
      user: { userType: 'JaM-admin', email: 'admin@web-jam.com' },
    };
    render(
      <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
        <AdminDatabase />
      </AuthContext.Provider>,
    );

    expect(screen.getByTestId('admin-database-unauthorized')).toBeInTheDocument();
  });

  it('renders page and loads runs for Developer role', async () => {
    vi.spyOn(adminDatabaseUtils, 'listRuns').mockResolvedValueOnce(sampleRuns);
    const auth = {
      ...defaultAuth,
      isAuthenticated: true,
      token: 'valid-token',
      user: { userType: 'Developer', email: 'josh@web-jam.com' },
    };

    render(
      <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
        <AdminDatabase />
      </AuthContext.Provider>,
    );

    expect(screen.getByTestId('admin-database-page')).toBeInTheDocument();
    await waitFor(() => {
      expect(adminDatabaseUtils.listRuns).toHaveBeenCalledWith('valid-token');
    });

    expect(screen.getByText('Admin Database')).toBeInTheDocument();
    expect(screen.getByTestId('admin-database-status')).toBeInTheDocument();
    expect(screen.getByTestId('backup-runs-table')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();
    expect(screen.getByTestId('run-size-2026-10-10T10-00-00-000Z')).toHaveTextContent('5.5 MB');
    expect(screen.getByTestId('run-size-2026-10-09T12-00-00-000Z')).toHaveTextContent('—');
  });

  it('displays status line with age in red when no good run exists', async () => {
    const failedOnlyRuns: BackupRunSummary[] = [
      {
        name: '2026-10-11T10-00-00-000Z',
        startTime: '2026-10-11T10:00:00.000Z',
        startedAt: '2026-10-11T10:00:00.000Z',
        trigger: 'daily check',
        state: 'failed',
        size: null,
        dropboxPath: '',
        path: '',
        collections: {},
        databases: {},
      },
    ];
    vi.spyOn(adminDatabaseUtils, 'listRuns').mockResolvedValueOnce(failedOnlyRuns);
    const auth = {
      ...defaultAuth,
      isAuthenticated: true,
      token: 'valid-token',
      user: { userType: 'Developer', email: 'josh@web-jam.com' },
    };

    render(
      <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
        <AdminDatabase />
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('newest-good-run-age')).toBeInTheDocument();
    });

    const ageElement = screen.getByTestId('newest-good-run-age');
    expect(ageElement).toHaveTextContent('none');
    expect(ageElement).toHaveStyle({ color: '#d32f2f' });

    const mostRecentElement = screen.getByTestId('most-recent-run-result');
    expect(mostRecentElement).toHaveTextContent('failed');
  });

  it('displays status line with age in normal color when newest good run is <= 24 hours old', async () => {
    const recentGoodRun: BackupRunSummary[] = [
      {
        name: new Date().toISOString().replace(/[:.]/g, '-'),
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        trigger: 'daily check',
        state: 'good',
        size: 5800000,
        dropboxPath: '/webjam-backups/recent',
        path: '/webjam-backups/recent',
        collections: { webjamsalem: { users: 10 } },
        databases: {},
      },
    ];
    vi.spyOn(adminDatabaseUtils, 'listRuns').mockResolvedValue(recentGoodRun);
    const auth = {
      ...defaultAuth,
      isAuthenticated: true,
      token: 'valid-token',
      user: { userType: 'Developer', email: 'josh@web-jam.com' },
    };

    render(
      <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
        <AdminDatabase />
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('newest-good-run-age')).toHaveTextContent('2 hours ago');
    });

    const ageElement = screen.getByTestId('newest-good-run-age');
    expect(ageElement).not.toHaveStyle({ color: '#d32f2f' });
  });

  it('displays status line with age in red when newest good run is over 24 hours old', async () => {
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const oldGoodRun: BackupRunSummary[] = [
      {
        name: twoDaysAgo.replace(/[:.]/g, '-'),
        startTime: twoDaysAgo,
        startedAt: twoDaysAgo,
        trigger: 'daily check',
        state: 'good',
        size: 5800000,
        dropboxPath: `/webjam-backups/${twoDaysAgo}`,
        path: `/webjam-backups/${twoDaysAgo}`,
        collections: { webjamsalem: { users: 10 } },
        databases: {},
      },
    ];
    vi.spyOn(adminDatabaseUtils, 'listRuns').mockResolvedValue(oldGoodRun);
    const auth = {
      ...defaultAuth,
      isAuthenticated: true,
      token: 'valid-token',
      user: { userType: 'Developer', email: 'josh@web-jam.com' },
    };

    render(
      <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
        <AdminDatabase />
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('newest-good-run-age')).toHaveTextContent('2 days ago');
    });

    const ageElement = screen.getByTestId('newest-good-run-age');
    expect(ageElement).toHaveStyle({ color: '#d32f2f' });
  });

  it('displays empty message when runs list is empty', async () => {
    vi.spyOn(adminDatabaseUtils, 'listRuns').mockResolvedValueOnce([]);
    const auth = {
      ...defaultAuth,
      isAuthenticated: true,
      token: 'valid-token',
      user: { userType: 'Developer', email: 'josh@web-jam.com' },
    };

    render(
      <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
        <AdminDatabase />
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('No backup runs found')).toBeInTheDocument();
    });
  });

  it('displays error message when listRuns fails', async () => {
    vi.spyOn(adminDatabaseUtils, 'listRuns').mockRejectedValueOnce(new Error('Network error loading runs'));
    const auth = {
      ...defaultAuth,
      isAuthenticated: true,
      token: 'valid-token',
      user: { userType: 'Developer', email: 'josh@web-jam.com' },
    };

    render(
      <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
        <AdminDatabase />
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('admin-database-error')).toHaveTextContent('Network error loading runs');
    });
  });

  it('expands row to display database collections and record counts', async () => {
    vi.spyOn(adminDatabaseUtils, 'listRuns').mockResolvedValueOnce(sampleRuns);
    const auth = {
      ...defaultAuth,
      isAuthenticated: true,
      token: 'valid-token',
      user: { userType: 'Developer', email: 'josh@web-jam.com' },
    };

    render(
      <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
        <AdminDatabase />
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('backup-run-row-2026-10-10T10-00-00-000Z')).toBeInTheDocument();
    });

    const expandBtn = screen.getByTestId('backup-run-expand-2026-10-10T10-00-00-000Z');
    fireEvent.click(expandBtn);

    await waitFor(() => {
      expect(screen.getByTestId('backup-run-details-2026-10-10T10-00-00-000Z')).toBeInTheDocument();
    });

    expect(screen.getByText('Database: webjamsalem')).toBeInTheDocument();
    expect(screen.getByText('users')).toBeInTheDocument();
    expect(screen.getByText('gigs')).toBeInTheDocument();
    expect(screen.getByText('142')).toBeInTheDocument();

    // Collapse
    fireEvent.click(expandBtn);
    await waitFor(() => {
      expect(screen.queryByTestId('backup-run-details-2026-10-10T10-00-00-000Z')).not.toBeInTheDocument();
    });
  });

  it('handles row with empty collections details gracefully', async () => {
    const runWithoutColls: BackupRunSummary = {
      name: 'run-empty',
      startTime: '2026-10-11T00:00:00.000Z',
      startedAt: '2026-10-11T00:00:00.000Z',
      trigger: 'manual',
      state: 'incomplete',
      size: null,
      dropboxPath: '/path',
      path: '/path',
      collections: {},
      databases: {},
    };
    render(
      <table>
        <tbody>
          <RunRow run={runWithoutColls} />
        </tbody>
      </table>,
    );

    const expandBtn = screen.getByTestId('backup-run-expand-run-empty');
    fireEvent.click(expandBtn);

    await waitFor(() => {
      expect(screen.getByText('No collection details recorded')).toBeInTheDocument();
    });
  });

  it('handles row with database having 0 collections gracefully', async () => {
    const runWithEmptyDb: BackupRunSummary = {
      name: 'run-empty-db',
      startTime: '2026-10-11T00:00:00.000Z',
      startedAt: '2026-10-11T00:00:00.000Z',
      trigger: 'manual',
      state: 'incomplete',
      size: null,
      dropboxPath: '/path',
      path: '/path',
      collections: { emptyDb: {} },
      databases: {},
    };
    render(
      <table>
        <tbody>
          <RunRow run={runWithEmptyDb} />
        </tbody>
      </table>,
    );

    const expandBtn = screen.getByTestId('backup-run-expand-run-empty-db');
    fireEvent.click(expandBtn);

    await waitFor(() => {
      expect(screen.getByText('No collections in this database')).toBeInTheDocument();
    });
  });

  describe('Back up now button workflow', () => {
    it('starts backup, polls until completion, and displays success result', async () => {
      vi.spyOn(adminDatabaseUtils, 'listRuns').mockResolvedValue(sampleRuns);
      vi.spyOn(adminDatabaseUtils, 'startBackup').mockResolvedValueOnce({
        name: 'op-123',
        message: 'backup started',
      });
      vi.spyOn(adminDatabaseUtils, 'getOperation')
        .mockResolvedValueOnce({
          name: 'op-123',
          type: 'backup',
          status: 'in_progress',
          startedAt: '2026-10-11T12:00:00.000Z',
          finishedAt: null,
          progress: 'exporting',
        })
        .mockResolvedValueOnce({
          name: 'op-123',
          type: 'backup',
          status: 'completed',
          startedAt: '2026-10-11T12:00:00.000Z',
          finishedAt: '2026-10-11T12:00:15.000Z',
          progress: 'complete',
        });

      const auth = {
        ...defaultAuth,
        isAuthenticated: true,
        token: 'valid-token',
        user: { userType: 'Developer', email: 'josh@web-jam.com' },
      };

      render(
        <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
          <AdminDatabase pollInterval={10} />
        </AuthContext.Provider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('backup-now-button')).toBeInTheDocument();
      });

      const backupBtn = screen.getByTestId('backup-now-button');
      fireEvent.click(backupBtn);

      await waitFor(() => {
        expect(adminDatabaseUtils.startBackup).toHaveBeenCalledWith('valid-token');
      });

      await waitFor(() => {
        expect(screen.getByTestId('backup-result')).toHaveTextContent('Backup completed successfully');
      });

      expect(screen.queryByTestId('backup-in-progress')).not.toBeInTheDocument();

      // Dismiss result alert
      const closeBtn = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeBtn);
      expect(screen.queryByTestId('backup-result')).not.toBeInTheDocument();
    });

    it('displays error result when operation fails during polling', async () => {
      vi.spyOn(adminDatabaseUtils, 'listRuns').mockResolvedValue(sampleRuns);
      vi.spyOn(adminDatabaseUtils, 'startBackup').mockResolvedValueOnce({
        name: 'op-fail',
        message: 'backup started',
      });
      vi.spyOn(adminDatabaseUtils, 'getOperation').mockResolvedValueOnce({
        name: 'op-fail',
        type: 'backup',
        status: 'failed',
        startedAt: '2026-10-11T12:00:00.000Z',
        finishedAt: '2026-10-11T12:00:05.000Z',
        progress: 'failed',
        error: 'Dropbox upload failed',
      });

      const auth = {
        ...defaultAuth,
        isAuthenticated: true,
        token: 'valid-token',
        user: { userType: 'Developer', email: 'josh@web-jam.com' },
      };

      render(
        <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
          <AdminDatabase pollInterval={10} />
        </AuthContext.Provider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('backup-now-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('backup-now-button'));

      await waitFor(() => {
        expect(adminDatabaseUtils.startBackup).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByTestId('backup-result')).toHaveTextContent('Dropbox upload failed');
      });
    });

    it('displays error when startBackup rejects', async () => {
      vi.spyOn(adminDatabaseUtils, 'listRuns').mockResolvedValue(sampleRuns);
      vi.spyOn(adminDatabaseUtils, 'startBackup').mockRejectedValueOnce(new Error('Dropbox settings absent'));

      const auth = {
        ...defaultAuth,
        isAuthenticated: true,
        token: 'valid-token',
        user: { userType: 'Developer', email: 'josh@web-jam.com' },
      };

      render(
        <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
          <AdminDatabase pollInterval={10} />
        </AuthContext.Provider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('backup-now-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('backup-now-button'));

      await waitFor(() => {
        expect(screen.getByTestId('backup-result')).toHaveTextContent('Dropbox settings absent');
      });
    });

    it('handles poll error when getOperation throws', async () => {
      vi.spyOn(adminDatabaseUtils, 'listRuns').mockResolvedValue(sampleRuns);
      vi.spyOn(adminDatabaseUtils, 'startBackup').mockResolvedValueOnce({
        name: 'op-network-err',
        message: 'backup started',
      });
      vi.spyOn(adminDatabaseUtils, 'getOperation').mockRejectedValueOnce(new Error('Network disconnected'));

      const auth = {
        ...defaultAuth,
        isAuthenticated: true,
        token: 'valid-token',
        user: { userType: 'Developer', email: 'josh@web-jam.com' },
      };

      render(
        <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
          <AdminDatabase pollInterval={10} />
        </AuthContext.Provider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('backup-now-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('backup-now-button'));

      await waitFor(() => {
        expect(screen.getByTestId('backup-result')).toHaveTextContent('Network disconnected');
      });
    });

    it('continues polling beyond 30 attempts until operation completes', async () => {
      vi.spyOn(adminDatabaseUtils, 'listRuns').mockResolvedValue(sampleRuns);
      vi.spyOn(adminDatabaseUtils, 'startBackup').mockResolvedValueOnce({
        name: 'op-long-success',
        message: 'backup started',
      });
      let callCount = 0;
      vi.spyOn(adminDatabaseUtils, 'getOperation').mockImplementation(async () => {
        callCount++;
        if (callCount < 35) {
          return {
            name: 'op-long-success',
            type: 'backup',
            status: 'in_progress',
            startedAt: '2026-10-11T12:00:00.000Z',
            finishedAt: null,
            progress: `exporting collection ${callCount}`,
          };
        }
        return {
          name: 'op-long-success',
          type: 'backup',
          status: 'completed',
          startedAt: '2026-10-11T12:00:00.000Z',
          finishedAt: '2026-10-11T12:00:40.000Z',
          progress: 'complete',
        };
      });

      const auth = {
        ...defaultAuth,
        isAuthenticated: true,
        token: 'valid-token',
        user: { userType: 'Developer', email: 'josh@web-jam.com' },
      };

      render(
        <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
          <AdminDatabase pollInterval={5} />
        </AuthContext.Provider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('backup-now-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('backup-now-button'));

      await waitFor(() => {
        expect(screen.getByTestId('backup-result')).toHaveTextContent('Backup completed successfully');
      }, { timeout: 4000 });

      expect(callCount).toBeGreaterThanOrEqual(35);
    });

    it('continues polling beyond 30 attempts until operation fails', async () => {
      vi.spyOn(adminDatabaseUtils, 'listRuns').mockResolvedValue(sampleRuns);
      vi.spyOn(adminDatabaseUtils, 'startBackup').mockResolvedValueOnce({
        name: 'op-long-fail',
        message: 'backup started',
      });
      let callCount = 0;
      vi.spyOn(adminDatabaseUtils, 'getOperation').mockImplementation(async () => {
        callCount++;
        if (callCount < 35) {
          return {
            name: 'op-long-fail',
            type: 'backup',
            status: 'in_progress',
            startedAt: '2026-10-11T12:00:00.000Z',
            finishedAt: null,
            progress: 'exporting',
          };
        }
        return {
          name: 'op-long-fail',
          type: 'backup',
          status: 'failed',
          startedAt: '2026-10-11T12:00:00.000Z',
          finishedAt: '2026-10-11T12:00:40.000Z',
          progress: 'failed',
          error: 'Dropbox upload failed after 40 seconds',
        };
      });

      const auth = {
        ...defaultAuth,
        isAuthenticated: true,
        token: 'valid-token',
        user: { userType: 'Developer', email: 'josh@web-jam.com' },
      };

      render(
        <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
          <AdminDatabase pollInterval={5} />
        </AuthContext.Provider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('backup-now-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('backup-now-button'));

      await waitFor(() => {
        expect(screen.getByTestId('backup-result')).toHaveTextContent('Dropbox upload failed after 40 seconds');
      }, { timeout: 4000 });

      expect(callCount).toBeGreaterThanOrEqual(35);
    });

    it('cancels polling and does not update state after unmount', async () => {
      vi.spyOn(adminDatabaseUtils, 'listRuns').mockResolvedValue(sampleRuns);
      vi.spyOn(adminDatabaseUtils, 'startBackup').mockResolvedValueOnce({
        name: 'op-unmount',
        message: 'backup started',
      });
      let resolveOp: (val: BackupOperation) => void = () => {};
      vi.spyOn(adminDatabaseUtils, 'getOperation').mockImplementation(
        () => new Promise<BackupOperation>((resolve) => {
          resolveOp = resolve;
        }),
      );

      const auth = {
        ...defaultAuth,
        isAuthenticated: true,
        token: 'valid-token',
        user: { userType: 'Developer', email: 'josh@web-jam.com' },
      };

      const { unmount } = render(
        <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
          <AdminDatabase pollInterval={5} />
        </AuthContext.Provider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('backup-now-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('backup-now-button'));

      await waitFor(() => {
        expect(adminDatabaseUtils.getOperation).toHaveBeenCalled();
      });

      const listRunsCallCount = (adminDatabaseUtils.listRuns as any).mock.calls.length;

      unmount();

      resolveOp({
        name: 'op-unmount',
        type: 'backup',
        status: 'completed',
        startedAt: '2026-10-11T12:00:00.000Z',
        finishedAt: '2026-10-11T12:00:10.000Z',
        progress: 'complete',
      });

      await new Promise((r) => { setTimeout(r, 20); });

      expect((adminDatabaseUtils.listRuns as any).mock.calls.length).toBe(listRunsCallCount);
    });

    it('cancels polling when authorization is lost', async () => {
      vi.spyOn(adminDatabaseUtils, 'listRuns').mockResolvedValue(sampleRuns);
      vi.spyOn(adminDatabaseUtils, 'startBackup').mockResolvedValueOnce({
        name: 'op-signout',
        message: 'backup started',
      });
      let resolveOp: (val: BackupOperation) => void = () => {};
      vi.spyOn(adminDatabaseUtils, 'getOperation').mockImplementation(
        () => new Promise<BackupOperation>((resolve) => {
          resolveOp = resolve;
        }),
      );

      const initialAuth = {
        ...defaultAuth,
        isAuthenticated: true,
        token: 'valid-token',
        user: { userType: 'Developer', email: 'josh@web-jam.com' },
      };

      const { rerender } = render(
        <AuthContext.Provider value={{ auth: initialAuth, setAuth: vi.fn() }}>
          <AdminDatabase pollInterval={5} />
        </AuthContext.Provider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('backup-now-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('backup-now-button'));

      await waitFor(() => {
        expect(adminDatabaseUtils.getOperation).toHaveBeenCalled();
      });

      const listRunsCallCount = (adminDatabaseUtils.listRuns as any).mock.calls.length;

      const signedOutAuth = {
        ...defaultAuth,
        isAuthenticated: false,
        token: '',
        user: { userType: '', email: '' },
      };

      rerender(
        <AuthContext.Provider value={{ auth: signedOutAuth, setAuth: vi.fn() }}>
          <AdminDatabase pollInterval={5} />
        </AuthContext.Provider>,
      );

      expect(screen.getByTestId('admin-database-unauthorized')).toBeInTheDocument();

      resolveOp({
        name: 'op-signout',
        type: 'backup',
        status: 'completed',
        startedAt: '2026-10-11T12:00:00.000Z',
        finishedAt: '2026-10-11T12:00:10.000Z',
        progress: 'complete',
      });

      await new Promise((r) => { setTimeout(r, 20); });

      expect((adminDatabaseUtils.listRuns as any).mock.calls.length).toBe(listRunsCallCount);
    });

    it('opens RestoreDialog when Restore button is clicked', async () => {
      vi.spyOn(adminDatabaseUtils, 'listRuns').mockResolvedValue(sampleRuns);
      const auth = {
        ...defaultAuth,
        isAuthenticated: true,
        token: 'valid-token',
        user: { userType: 'Developer', email: 'josh@web-jam.com' },
      };

      render(
        <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
          <AdminDatabase pollInterval={10} />
        </AuthContext.Provider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('restore-button')).toBeInTheDocument();
      });

      expect(screen.getByTestId('restore-dialog')).toHaveAttribute('data-expanded', 'false');
      fireEvent.click(screen.getByTestId('restore-button'));

      await waitFor(() => {
        expect(screen.getByTestId('restore-dialog')).toHaveAttribute('data-expanded', 'true');
      });
    });

    it('opens CopyToDevDialog when Copy production into DEV button is clicked', async () => {
      vi.spyOn(adminDatabaseUtils, 'listRuns').mockResolvedValue(sampleRuns);
      const auth = {
        ...defaultAuth,
        isAuthenticated: true,
        token: 'valid-token',
        user: { userType: 'Developer', email: 'josh@web-jam.com' },
      };

      render(
        <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
          <AdminDatabase pollInterval={10} />
        </AuthContext.Provider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('copy-to-dev-button')).toBeInTheDocument();
      });

      expect(screen.getByTestId('copy-to-dev-dialog')).toHaveAttribute('data-expanded', 'false');
      fireEvent.click(screen.getByTestId('copy-to-dev-button'));

      await waitFor(() => {
        expect(screen.getByTestId('copy-to-dev-dialog')).toHaveAttribute('data-expanded', 'true');
      });
    });

    it('renders the Diagrams component when user is authorized', async () => {
      vi.spyOn(adminDatabaseUtils, 'listRuns').mockResolvedValue([]);
      const auth = {
        ...defaultAuth,
        isAuthenticated: true,
        token: 'valid-token',
        user: { userType: 'Developer', email: 'josh@web-jam.com' },
      };
      render(
        <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
          <AdminDatabase />
        </AuthContext.Provider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('admin-database-diagrams')).toBeInTheDocument();
      });
    });
  });
});

