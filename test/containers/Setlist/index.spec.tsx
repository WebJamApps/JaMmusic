import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthContext, defaultAuth, type Iauth } from 'src/providers/Auth.provider';
import { Setlist } from 'src/containers/Setlist';
import setlistUtils, { ISetlist } from 'src/containers/Setlist/setlist.utils';
import commonUtils from 'src/lib/utils';
import { Isong } from 'src/providers/Data.provider';

const mockAdminAuth: Iauth = {
  isAuthenticated: true,
  error: '',
  token: 'admin-test-token',
  user: { userType: 'JaM-admin', email: 'admin@web-jam.com' },
};

const mockSetlists: ISetlist[] = [
  {
    _id: 'setlist-1',
    title: 'Saturday Pub Show',
    description: 'Acoustic evening set',
    gigDate: '2026-09-25',
    items: [
      {
        order: 1,
        title: 'Song One',
        artist: 'Josh Sherman',
        durationSeconds: 180,
      },
    ],
  },
  {
    _id: 'setlist-2',
    title: 'Sunday Winery Gig',
    description: 'Relaxed afternoon',
    items: [],
  },
];

const mockSongs: Isong[] = [
  {
    _id: 'song-c1',
    title: 'Peaceful Easy Feeling',
    artist: 'Eagles',
    category: 'cover',
    url: 'https://example.com/song.mp3',
    year: 1972,
  },
];

const wrap = (auth: Iauth = defaultAuth) => (
  <AuthContext.Provider value={{ auth, setAuth: () => { /* noop */ } }}>
    <Setlist />
  </AuthContext.Provider>
);

describe('Setlist Container', () => {
  beforeEach(() => {
    setlistUtils.getSetlists = vi.fn().mockResolvedValue(mockSetlists);
    setlistUtils.getSongCatalog = vi.fn().mockResolvedValue(mockSongs);
    setlistUtils.createSetlist = vi.fn().mockResolvedValue({ _id: 'setlist-3', title: 'New Gig', items: [] });
    setlistUtils.updateSetlist = vi.fn().mockResolvedValue({ _id: 'setlist-1', title: 'Updated Gig', items: [] });
    setlistUtils.deleteSetlist = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(commonUtils, 'notify').mockImplementation(() => { /* noop */ });
    vi.spyOn(commonUtils, 'setTitleAndScroll').mockImplementation(() => { /* noop */ });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading spinner and loads setlists and catalog on mount', async () => {
    render(wrap(defaultAuth));

    await waitFor(() => {
      expect(screen.getByTestId('setlist-page-container')).toBeInTheDocument();
    });

    expect(setlistUtils.getSetlists).toHaveBeenCalled();
    expect(setlistUtils.getSongCatalog).toHaveBeenCalled();
    expect(screen.getByText('Saturday Pub Show')).toBeInTheDocument();
  });

  it('displays error alert if loading setlists fails', async () => {
    setlistUtils.getSetlists = vi.fn().mockRejectedValue(new Error('Network error fetching setlists'));

    render(wrap(defaultAuth));

    await waitFor(() => {
      expect(screen.getByTestId('setlist-page-error')).toHaveTextContent('Network error fetching setlists');
    });
  });

  it('allows user to switch between setlists', async () => {
    render(wrap(defaultAuth));

    await waitFor(() => {
      expect(screen.getByText('Saturday Pub Show')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'setlist-2' } });

    expect(screen.getAllByText('Sunday Winery Gig').length).toBeGreaterThanOrEqual(1);
  });

  it('admin can open create setlist dialog and save new setlist', async () => {
    render(wrap(mockAdminAuth));

    await waitFor(() => {
      expect(screen.getByTestId('create-setlist-btn')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('create-setlist-btn'));

    expect(screen.getByTestId('setlist-builder-dialog')).toBeInTheDocument();
    const titleInput = screen.getByTestId('setlist-title-input');
    fireEvent.change(titleInput, { target: { value: 'New Gig' } });

    const saveBtn = screen.getByTestId('save-setlist-btn');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(setlistUtils.createSetlist).toHaveBeenCalledWith(
        'admin-test-token',
        expect.objectContaining({ title: 'New Gig' }),
      );
      expect(commonUtils.notify).toHaveBeenCalledWith('Success', 'Setlist created successfully', 'success');
    });
  });

  it('admin can open edit setlist dialog and save updates', async () => {
    render(wrap(mockAdminAuth));

    await waitFor(() => {
      expect(screen.getByTestId('edit-setlist-btn')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('edit-setlist-btn'));

    expect(screen.getByTestId('setlist-builder-dialog')).toBeInTheDocument();
    const titleInput = screen.getByTestId('setlist-title-input');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

    const saveBtn = screen.getByTestId('save-setlist-btn');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(setlistUtils.updateSetlist).toHaveBeenCalledWith(
        'admin-test-token',
        'setlist-1',
        expect.objectContaining({ title: 'Updated Title' }),
      );
      expect(commonUtils.notify).toHaveBeenCalledWith('Success', 'Setlist updated successfully', 'success');
    });
  });

  it('admin can open delete confirmation and confirm delete', async () => {
    render(wrap(mockAdminAuth));

    await waitFor(() => {
      expect(screen.getByTestId('delete-setlist-btn')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('delete-setlist-btn'));

    expect(screen.getByTestId('delete-setlist-dialog')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();

    const confirmDeleteBtn = screen.getByTestId('confirm-delete-setlist-btn');
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(setlistUtils.deleteSetlist).toHaveBeenCalledWith('admin-test-token', 'setlist-1');
      expect(commonUtils.notify).toHaveBeenCalledWith('Success', 'Setlist deleted successfully', 'success');
    });
  });

  it('admin can cancel delete confirmation dialog', async () => {
    render(wrap(mockAdminAuth));

    await waitFor(() => {
      expect(screen.getByTestId('delete-setlist-btn')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('delete-setlist-btn'));
    expect(screen.getByTestId('delete-setlist-dialog')).toBeInTheDocument();

    const cancelDeleteBtn = screen.getByTestId('cancel-delete-setlist-btn');
    fireEvent.click(cancelDeleteBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('delete-setlist-dialog')).not.toBeInTheDocument();
    });
    expect(setlistUtils.deleteSetlist).not.toHaveBeenCalled();
  });

  it('handles error during delete gracefully', async () => {
    setlistUtils.deleteSetlist = vi.fn().mockRejectedValue(new Error('Deletion failed on server'));

    render(wrap(mockAdminAuth));

    await waitFor(() => {
      expect(screen.getByTestId('delete-setlist-btn')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('delete-setlist-btn'));
    const confirmDeleteBtn = screen.getByTestId('confirm-delete-setlist-btn');
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(commonUtils.notify).toHaveBeenCalledWith('Error', 'Deletion failed on server', 'danger');
    });
  });
});
