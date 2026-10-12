/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { RestoreDialog } from 'src/containers/AdminDatabase/RestoreDialog';
import adminDatabaseUtils, {
  type BackupRunSummary,
  type BackupOperation,
  type RestoreResult,
} from 'src/containers/AdminDatabase/admin-database.utils';

describe('RestoreDialog Component', () => {
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
    collections: { webjamsalem: { users: 5, gigs: 10 } },
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

  const getDateInput = () => {
    const el = screen.getByTestId('restore-date-input');
    return el.tagName === 'INPUT' ? (el as HTMLInputElement) : el.querySelector('input')!;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog and lists only good runs in dropdown', () => {
    render(
      <RestoreDialog
        open
        runs={[goodRun1, failedRun, goodRun2]}
        token={mockToken}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        pollInterval={10}
      />,
    );

    expect(screen.getByTestId('restore-dialog')).toBeInTheDocument();
    expect(screen.getByText('Restore Production from Backup')).toBeInTheDocument();
    expect(screen.getByTestId('restore-run-select')).toBeInTheDocument();

    // Check options present in DOM
    expect(screen.getByTestId(`restore-run-option-${goodRun1.name}`)).toBeInTheDocument();
    expect(screen.getByTestId(`restore-run-option-${goodRun2.name}`)).toBeInTheDocument();
    expect(screen.queryByTestId(`restore-run-option-${failedRun.name}`)).not.toBeInTheDocument();
  });

  it('handles case with no good runs available', () => {
    render(
      <RestoreDialog
        open
        runs={[failedRun]}
        token={mockToken}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        pollInterval={10}
      />,
    );

    expect(screen.getByText('No good backup runs available')).toBeInTheDocument();
    const restoreBtn = screen.getByTestId('restore-submit-button');
    expect(restoreBtn).toBeDisabled();
  });

  it('keeps Restore button disabled until typed date matches chosen run date', () => {
    render(
      <RestoreDialog
        open
        runs={[goodRun1]}
        token={mockToken}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        pollInterval={10}
      />,
    );

    const restoreBtn = screen.getByTestId('restore-submit-button');
    const dateInput = getDateInput();

    // Expected date is '2026-10-10'
    expect(screen.getByText(/To confirm restore, type the backup run date/)).toBeInTheDocument();
    expect(restoreBtn).toBeDisabled();

    // Typing wrong date
    fireEvent.change(dateInput, { target: { value: '2026-10-11' } });
    expect(restoreBtn).toBeDisabled();
    expect(screen.getByText("Date does not match '2026-10-10'")).toBeInTheDocument();

    // Typing exact date
    fireEvent.change(dateInput, { target: { value: '2026-10-10' } });
    expect(restoreBtn).not.toBeDisabled();
    expect(screen.queryByText("Date does not match '2026-10-10'")).not.toBeInTheDocument();
  });

  it('successfully starts restore, polls to completion, and renders side-by-side counts', async () => {
    vi.spyOn(adminDatabaseUtils, 'startRestore').mockResolvedValueOnce({
      name: 'restore-2026-10-11T12-00-00-000Z',
      message: 'restore started',
    });

    const mockResult: RestoreResult = {
      collections: [
        { collection: 'users', restored: 5, manifest: 5 },
        { collection: 'gigs', restored: 142, manifest: 142 },
        { collection: 'books', restored: 2, manifest: null },
      ],
      missingIndexes: [{ collection: 'users', index: 'email_1' }],
      indexFailures: [{ collection: 'gigs', message: 'failed to rebuild index date_1' }],
    };

    vi.spyOn(adminDatabaseUtils, 'getOperation')
      .mockResolvedValueOnce({
        name: 'restore-2026-10-11T12-00-00-000Z',
        type: 'restore',
        status: 'in_progress',
        startedAt: '2026-10-11T12:00:00.000Z',
        finishedAt: null,
        progress: 'downloading files',
      })
      .mockResolvedValueOnce({
        name: 'restore-2026-10-11T12-00-00-000Z',
        type: 'restore',
        status: 'completed',
        startedAt: '2026-10-11T12:00:00.000Z',
        finishedAt: '2026-10-11T12:00:25.000Z',
        progress: 'complete',
        result: mockResult,
      });

    render(
      <RestoreDialog
        open
        runs={[goodRun1]}
        token={mockToken}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        pollInterval={10}
      />,
    );

    const dateInput = getDateInput();
    fireEvent.change(dateInput, { target: { value: '2026-10-10' } });

    const restoreBtn = screen.getByTestId('restore-submit-button');
    expect(restoreBtn).not.toBeDisabled();
    fireEvent.click(restoreBtn);

    await waitFor(() => {
      expect(adminDatabaseUtils.startRestore).toHaveBeenCalledWith(
        mockToken,
        goodRun1.name,
        '2026-10-10',
      );
    });

    // In progress indicator appears
    await waitFor(() => {
      expect(screen.getByTestId('restore-in-progress')).toBeInTheDocument();
    });

    // Results table rendered
    await waitFor(() => {
      expect(screen.getByTestId('restore-success-alert')).toHaveTextContent('Restore completed successfully');
      expect(screen.getByTestId('restore-collections-table')).toBeInTheDocument();
    });

    expect(mockOnComplete).toHaveBeenCalled();

    // Check side-by-side counts
    expect(screen.getByTestId('restore-count-users')).toHaveTextContent('5');
    expect(screen.getByTestId('restore-manifest-users')).toHaveTextContent('5');

    expect(screen.getByTestId('restore-count-gigs')).toHaveTextContent('142');
    expect(screen.getByTestId('restore-manifest-gigs')).toHaveTextContent('142');

    expect(screen.getByTestId('restore-count-books')).toHaveTextContent('2');
    expect(screen.getByTestId('restore-manifest-books')).toHaveTextContent('—');

    // Missing indexes and index failures displayed
    expect(screen.getByTestId('restore-missing-indexes')).toHaveTextContent('users: email_1');
    expect(screen.getByTestId('restore-index-failures')).toHaveTextContent('gigs: failed to rebuild index date_1');

    // Close button should change label to Close
    const closeBtn = screen.getByTestId('restore-dialog-close');
    expect(closeBtn).toHaveTextContent('Close');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays backend refusal message when startRestore rejects', async () => {
    vi.spyOn(adminDatabaseUtils, 'startRestore').mockRejectedValueOnce(
      new Error('a backup or restore is in progress'),
    );

    render(
      <RestoreDialog
        open
        runs={[goodRun1]}
        token={mockToken}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        pollInterval={10}
      />,
    );

    const dateInput = getDateInput();
    fireEvent.change(dateInput, { target: { value: '2026-10-10' } });

    fireEvent.click(screen.getByTestId('restore-submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('restore-error-alert')).toHaveTextContent('a backup or restore is in progress');
    });

    expect(screen.queryByTestId('restore-in-progress')).not.toBeInTheDocument();
  });

  it('displays backend refusal message when operation fails during polling', async () => {
    vi.spyOn(adminDatabaseUtils, 'startRestore').mockResolvedValueOnce({
      name: 'restore-fail',
      message: 'restore started',
    });

    const failedOp: BackupOperation = {
      name: 'restore-fail',
      type: 'restore',
      status: 'failed',
      startedAt: '2026-10-11T12:00:00.000Z',
      finishedAt: '2026-10-11T12:00:05.000Z',
      progress: 'failed',
      error: 'count in users (4) differs from manifest (5)',
    };

    vi.spyOn(adminDatabaseUtils, 'getOperation').mockResolvedValueOnce(failedOp);

    render(
      <RestoreDialog
        open
        runs={[goodRun1]}
        token={mockToken}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        pollInterval={10}
      />,
    );

    const dateInput = getDateInput();
    fireEvent.change(dateInput, { target: { value: '2026-10-10' } });

    fireEvent.click(screen.getByTestId('restore-submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('restore-error-alert')).toHaveTextContent(
        'count in users (4) differs from manifest (5)',
      );
    });

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('handles polling network exception gracefully', async () => {
    vi.spyOn(adminDatabaseUtils, 'startRestore').mockResolvedValueOnce({
      name: 'restore-net-err',
      message: 'restore started',
    });

    vi.spyOn(adminDatabaseUtils, 'getOperation').mockRejectedValueOnce(
      new Error('Network disconnected'),
    );

    render(
      <RestoreDialog
        open
        runs={[goodRun1]}
        token={mockToken}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        pollInterval={10}
      />,
    );

    const dateInput = getDateInput();
    fireEvent.change(dateInput, { target: { value: '2026-10-10' } });

    fireEvent.click(screen.getByTestId('restore-submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('restore-error-alert')).toHaveTextContent('Network disconnected');
    });
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(
      <RestoreDialog
        open
        runs={[goodRun1]}
        token={mockToken}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        pollInterval={10}
      />,
    );

    const cancelBtn = screen.getByTestId('restore-dialog-close');
    expect(cancelBtn).toHaveTextContent('Cancel');
    fireEvent.click(cancelBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles completed operation with null result without fabricating success or empty collections', async () => {
    vi.spyOn(adminDatabaseUtils, 'startRestore').mockResolvedValueOnce({
      name: 'restore-null-res',
      message: 'restore started',
    });

    vi.spyOn(adminDatabaseUtils, 'getOperation').mockResolvedValueOnce({
      name: 'restore-null-res',
      type: 'restore',
      status: 'completed',
      startedAt: '2026-10-11T12:00:00.000Z',
      finishedAt: '2026-10-11T12:00:10.000Z',
      progress: 'complete',
      result: null,
    });

    render(
      <RestoreDialog
        open
        runs={[goodRun1]}
        token={mockToken}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        pollInterval={10}
      />,
    );

    const dateInput = getDateInput();
    fireEvent.change(dateInput, { target: { value: '2026-10-10' } });
    fireEvent.click(screen.getByTestId('restore-submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('restore-error-alert')).toHaveTextContent(
        'Restore operation completed but result is missing or invalid',
      );
    });

    expect(screen.queryByTestId('restore-success-alert')).not.toBeInTheDocument();
    expect(screen.queryByTestId('restore-collections-table')).not.toBeInTheDocument();
    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('handles completed operation with incomplete/null rows without crashing', async () => {
    vi.spyOn(adminDatabaseUtils, 'startRestore').mockResolvedValueOnce({
      name: 'restore-incomplete-rows',
      message: 'restore started',
    });

    vi.spyOn(adminDatabaseUtils, 'getOperation').mockResolvedValueOnce({
      name: 'restore-incomplete-rows',
      type: 'restore',
      status: 'completed',
      startedAt: '2026-10-11T12:00:00.000Z',
      finishedAt: '2026-10-11T12:00:10.000Z',
      progress: 'complete',
      result: {
        collections: [{ collection: 'users' }],
        missingIndexes: [],
        indexFailures: [],
      },
    });

    render(
      <RestoreDialog
        open
        runs={[goodRun1]}
        token={mockToken}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        pollInterval={10}
      />,
    );

    const dateInput = getDateInput();
    fireEvent.change(dateInput, { target: { value: '2026-10-10' } });
    fireEvent.click(screen.getByTestId('restore-submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('restore-error-alert')).toHaveTextContent(
        'Restore operation completed but result is missing or invalid',
      );
    });

    expect(screen.queryByTestId('restore-success-alert')).not.toBeInTheDocument();
    expect(screen.queryByTestId('restore-collections-table')).not.toBeInTheDocument();
    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('handles completed operation with malformed index lists without crashing', async () => {
    vi.spyOn(adminDatabaseUtils, 'startRestore').mockResolvedValueOnce({
      name: 'restore-malformed-indexes',
      message: 'restore started',
    });

    vi.spyOn(adminDatabaseUtils, 'getOperation').mockResolvedValueOnce({
      name: 'restore-malformed-indexes',
      type: 'restore',
      status: 'completed',
      startedAt: '2026-10-11T12:00:00.000Z',
      finishedAt: '2026-10-11T12:00:10.000Z',
      progress: 'complete',
      result: {
        collections: [{ collection: 'users', restored: 5, manifest: 5 }],
        missingIndexes: [{ collection: 'users' }],
        indexFailures: [],
      },
    });

    render(
      <RestoreDialog
        open
        runs={[goodRun1]}
        token={mockToken}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        pollInterval={10}
      />,
    );

    const dateInput = getDateInput();
    fireEvent.change(dateInput, { target: { value: '2026-10-10' } });
    fireEvent.click(screen.getByTestId('restore-submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('restore-error-alert')).toHaveTextContent(
        'Restore operation completed but result is missing or invalid',
      );
    });

    expect(screen.queryByTestId('restore-success-alert')).not.toBeInTheDocument();
    expect(screen.queryByTestId('restore-collections-table')).not.toBeInTheDocument();
    expect(mockOnComplete).toHaveBeenCalled();
  });
});
