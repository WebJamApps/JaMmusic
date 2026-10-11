/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { CopyToDevDialog } from 'src/containers/AdminDatabase/CopyToDevDialog';
import adminDatabaseUtils, {
  type BackupRunSummary,
  type BackupOperation,
  type CopyResult,
} from 'src/containers/AdminDatabase/admin-database.utils';

describe('CopyToDevDialog Component', () => {
  const mockToken = 'mock-jwt-token';
  const mockOnClose = vi.fn();
  const mockOnComplete = vi.fn();

  const goodRun1: BackupRunSummary = {
    name: '2026-10-10T12-00-00-000Z',
    startTime: '2026-10-10T12:00:00.000Z',
    startedAt: '2026-10-10T12:00:00.000Z',
    trigger: 'daily check',
    state: 'good',
    size: 1024,
    dropboxPath: '/webjam-backups/2026-10-10T12-00-00-000Z',
    path: '/webjam-backups/2026-10-10T12-00-00-000Z',
    collections: { webjamsalem: { users: 5 } },
    databases: {},
  };

  const goodRun2: BackupRunSummary = {
    name: '2026-10-09T10-00-00-000Z',
    startTime: '2026-10-09T10:00:00.000Z',
    startedAt: '2026-10-09T10:00:00.000Z',
    trigger: 'backup button',
    state: 'good',
    size: 2048,
    dropboxPath: '/webjam-backups/2026-10-09T10-00-00-000Z',
    path: '/webjam-backups/2026-10-09T10-00-00-000Z',
    collections: { webjamsalem: { users: 4 } },
    databases: {},
  };

  const failedRun: BackupRunSummary = {
    name: '2026-10-08T10-00-00-000Z',
    startTime: '2026-10-08T10:00:00.000Z',
    startedAt: '2026-10-08T10:00:00.000Z',
    trigger: 'daily check',
    state: 'failed',
    size: null,
    dropboxPath: '/webjam-backups/2026-10-08T10-00-00-000Z',
    path: '',
    collections: {},
    databases: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog and lists only good runs in dropdown', () => {
    render(
      <CopyToDevDialog
        open
        runs={[goodRun1, failedRun, goodRun2]}
        token={mockToken}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        pollInterval={10}
      />,
    );

    expect(screen.getByTestId('copy-to-dev-dialog')).toBeInTheDocument();
    expect(screen.getByText('Copy Production into DEV')).toBeInTheDocument();
    expect(screen.getByTestId('copy-to-dev-run-select')).toBeInTheDocument();

    expect(screen.getByTestId(`copy-run-option-${goodRun1.name}`)).toBeInTheDocument();
    expect(screen.getByTestId(`copy-run-option-${goodRun2.name}`)).toBeInTheDocument();
    expect(screen.queryByTestId(`copy-run-option-${failedRun.name}`)).not.toBeInTheDocument();
  });

  it('handles case with no good runs available', () => {
    render(
      <CopyToDevDialog
        open
        runs={[failedRun]}
        token={mockToken}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        pollInterval={10}
      />,
    );

    expect(screen.getByText('No good backup runs available')).toBeInTheDocument();
    const copyBtn = screen.getByTestId('copy-to-dev-submit-button');
    expect(copyBtn).toBeDisabled();
  });

  it('starts copy to DEV, polls to completion, and renders collections, addresses replaced, and read-back check', async () => {
    vi.spyOn(adminDatabaseUtils, 'startCopyToDev').mockResolvedValueOnce({
      name: 'copy-to-dev-2026-10-11T12-00-00-000Z',
      message: 'copy to DEV started',
    });

    const mockResult: CopyResult = {
      collections: [
        {
          collection: 'users', copied: 5, manifest: 5, addressesReplaced: 4,
        },
        {
          collection: 'subscribers', copied: 12, manifest: 12, addressesReplaced: 12,
        },
      ],
      missingIndexes: [],
      indexFailures: [],
      readBack: {
        status: 'none',
        remaining: 0,
        message: 'clean (0 real email addresses found)',
      },
      clean: true,
    };

    vi.spyOn(adminDatabaseUtils, 'getOperation')
      .mockResolvedValueOnce({
        name: 'copy-to-dev-2026-10-11T12-00-00-000Z',
        type: 'copy-to-dev',
        status: 'in_progress',
        startedAt: '2026-10-11T12:00:00.000Z',
        finishedAt: null,
        progress: 'copying and scrubbing documents',
      })
      .mockResolvedValueOnce({
        name: 'copy-to-dev-2026-10-11T12-00-00-000Z',
        type: 'copy-to-dev',
        status: 'completed',
        startedAt: '2026-10-11T12:00:00.000Z',
        finishedAt: '2026-10-11T12:00:30.000Z',
        progress: 'complete',
        result: mockResult,
      });

    render(
      <CopyToDevDialog
        open
        runs={[goodRun1]}
        token={mockToken}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        pollInterval={10}
      />,
    );

    const copyBtn = screen.getByTestId('copy-to-dev-submit-button');
    expect(copyBtn).not.toBeDisabled();
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(adminDatabaseUtils.startCopyToDev).toHaveBeenCalledWith(mockToken, goodRun1.name);
    });

    await waitFor(() => {
      expect(screen.getByTestId('copy-to-dev-in-progress')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId('copy-to-dev-success-alert')).toHaveTextContent(
        'Copy to DEV completed successfully',
      );
    });

    expect(mockOnComplete).toHaveBeenCalled();

    // Check total addresses replaced and read-back check summary
    expect(screen.getByTestId('copy-total-addresses-replaced')).toHaveTextContent(
      'Total email addresses replaced: 16',
    );
    expect(screen.getByTestId('copy-read-back-result')).toHaveTextContent(
      'Read-back check: clean (0 real email addresses found)',
    );

    // Check table counts
    expect(screen.getByTestId('copy-collections-table')).toBeInTheDocument();
    expect(screen.getByTestId('copy-count-users')).toHaveTextContent('5');
    expect(screen.getByTestId('copy-manifest-users')).toHaveTextContent('5');
    expect(screen.getByTestId('copy-replaced-users')).toHaveTextContent('4');

    expect(screen.getByTestId('copy-count-subscribers')).toHaveTextContent('12');
    expect(screen.getByTestId('copy-manifest-subscribers')).toHaveTextContent('12');
    expect(screen.getByTestId('copy-replaced-subscribers')).toHaveTextContent('12');

    const closeBtn = screen.getByTestId('copy-to-dev-dialog-close');
    expect(closeBtn).toHaveTextContent('Close');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays the DEV-is-asleep message when DEV cluster is asleep', async () => {
    const devAsleepMessage = 'the DEV database is asleep or cannot be reached; '
      + 'Resume for the DEV cluster on the Atlas website wakes it';

    vi.spyOn(adminDatabaseUtils, 'startCopyToDev').mockResolvedValueOnce({
      name: 'copy-asleep',
      message: 'copy to DEV started',
    });

    const failedOp: BackupOperation = {
      name: 'copy-asleep',
      type: 'copy-to-dev',
      status: 'failed',
      startedAt: '2026-10-11T12:00:00.000Z',
      finishedAt: '2026-10-11T12:00:10.000Z',
      progress: 'failed',
      error: devAsleepMessage,
    };

    vi.spyOn(adminDatabaseUtils, 'getOperation').mockResolvedValueOnce(failedOp);

    render(
      <CopyToDevDialog
        open
        runs={[goodRun1]}
        token={mockToken}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        pollInterval={10}
      />,
    );

    fireEvent.click(screen.getByTestId('copy-to-dev-submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('copy-to-dev-error-alert')).toHaveTextContent(devAsleepMessage);
    });

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('displays setting refusal message when DEV_MONGO_DB_URI is missing or invalid', async () => {
    vi.spyOn(adminDatabaseUtils, 'startCopyToDev').mockRejectedValueOnce(
      new Error('DEV_MONGO_DB_URI is required'),
    );

    render(
      <CopyToDevDialog
        open
        runs={[goodRun1]}
        token={mockToken}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        pollInterval={10}
      />,
    );

    fireEvent.click(screen.getByTestId('copy-to-dev-submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('copy-to-dev-error-alert')).toHaveTextContent('DEV_MONGO_DB_URI is required');
    });

    expect(screen.queryByTestId('copy-to-dev-in-progress')).not.toBeInTheDocument();
  });

  it('handles polling network error gracefully', async () => {
    vi.spyOn(adminDatabaseUtils, 'startCopyToDev').mockResolvedValueOnce({
      name: 'copy-net-err',
      message: 'copy to DEV started',
    });

    vi.spyOn(adminDatabaseUtils, 'getOperation').mockRejectedValueOnce(
      new Error('Connection lost'),
    );

    render(
      <CopyToDevDialog
        open
        runs={[goodRun1]}
        token={mockToken}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        pollInterval={10}
      />,
    );

    fireEvent.click(screen.getByTestId('copy-to-dev-submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('copy-to-dev-error-alert')).toHaveTextContent('Connection lost');
    });
  });

  it('calls onClose when Cancel is clicked', () => {
    render(
      <CopyToDevDialog
        open
        runs={[goodRun1]}
        token={mockToken}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        pollInterval={10}
      />,
    );

    const cancelBtn = screen.getByTestId('copy-to-dev-dialog-close');
    expect(cancelBtn).toHaveTextContent('Cancel');
    fireEvent.click(cancelBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
