import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PerformanceViewer } from 'src/containers/Setlist/PerformanceViewer';
import { ISetlist } from 'src/containers/Setlist/setlist.utils';

const mockSetlist1: ISetlist = {
  _id: 'setlist-1',
  title: 'Roanoke Saturday Gig',
  description: 'Acoustic duo set on the patio',
  gigDate: '2026-09-20',
  items: [
    {
      _id: 'item-1',
      order: 1,
      title: 'Take It Easy',
      artist: 'Eagles',
      key: 'G',
      capo: '2',
      tempo: '130',
      durationSeconds: 210,
      notes: 'Josh starts with acoustic rhythm',
      playLink: 'https://example.com/take-it-easy.mp3',
      leadSheetUrl: 'https://example.com/take-it-easy.pdf',
    },
    {
      _id: 'item-2',
      order: 2,
      songId: {
        _id: 'song-catalog-1',
        title: 'Country Roads',
        artist: 'John Denver',
        url: 'https://example.com/country-roads.mp3',
      },
      durationSeconds: 195,
      key: 'A',
    },
  ],
};

const mockSetlist2: ISetlist = {
  _id: 'setlist-2',
  title: 'Blacksburg Coffeehouse',
  items: [],
};

const mockSetlistNamed: ISetlist = {
  _id: 'setlist-3',
  name: 'Fallback Named Setlist',
  items: [
    {
      order: 1,
      title: 'Simple Song',
      leadSheetUrl: 'https://example.com/chords.pdf',
    },
  ],
};

describe('PerformanceViewer', () => {
  it('renders empty message when no setlists are provided and user is non-admin', () => {
    render(
      <PerformanceViewer
        setlist={null}
        setlists={[]}
        onSelectSetlist={vi.fn()}
        isAdmin={false}
        onNewSetlist={vi.fn()}
        onEditSetlist={vi.fn()}
        onDeleteSetlist={vi.fn()}
      />,
    );

    expect(screen.getByText('No setlists available')).toBeInTheDocument();
    expect(screen.getByText('No setlists created yet.')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-actions-bar')).not.toBeInTheDocument();
  });

  it('renders create first setlist button when user is admin and no setlists exist', () => {
    const onNewSetlist = vi.fn();
    render(
      <PerformanceViewer
        setlist={null}
        setlists={[]}
        onSelectSetlist={vi.fn()}
        isAdmin={true}
        onNewSetlist={onNewSetlist}
        onEditSetlist={vi.fn()}
        onDeleteSetlist={vi.fn()}
      />,
    );

    const createFirstBtn = screen.getByRole('button', { name: /create first setlist/i });
    expect(createFirstBtn).toBeInTheDocument();
    fireEvent.click(createFirstBtn);
    expect(onNewSetlist).toHaveBeenCalledTimes(1);
  });

  it('renders active setlist with title, description, gig date, stats, and song list', () => {
    render(
      <PerformanceViewer
        setlist={mockSetlist1}
        setlists={[mockSetlist1, mockSetlist2]}
        onSelectSetlist={vi.fn()}
        isAdmin={false}
        onNewSetlist={vi.fn()}
        onEditSetlist={vi.fn()}
        onDeleteSetlist={vi.fn()}
      />,
    );

    expect(screen.getByText('Roanoke Saturday Gig')).toBeInTheDocument();
    expect(screen.getByText('Acoustic duo set on the patio')).toBeInTheDocument();
    expect(screen.getByTestId('stat-gig-date')).toHaveTextContent('2026-09-20');
    expect(screen.getByTestId('stat-song-count')).toHaveTextContent('2 songs');
    expect(screen.getByTestId('stat-total-duration')).toHaveTextContent('6m 45s');

    // Song 1
    expect(screen.getByText('Take It Easy')).toBeInTheDocument();
    expect(screen.getByText('Eagles')).toBeInTheDocument();
    expect(screen.getByText('Key: G')).toBeInTheDocument();
    expect(screen.getByText('Capo 2')).toBeInTheDocument();
    expect(screen.getByText('130 BPM')).toBeInTheDocument();
    expect(screen.getByText('3:30')).toBeInTheDocument();
    expect(screen.getByText('Josh starts with acoustic rhythm')).toBeInTheDocument();
    expect(screen.getAllByTestId('song-play-link')[0]).toHaveAttribute('href', 'https://example.com/take-it-easy.mp3');
    expect(screen.getByTestId('song-leadsheet-link')).toHaveAttribute('href', 'https://example.com/take-it-easy.pdf');

    // Song 2 (populated via songId object)
    expect(screen.getByText('Country Roads')).toBeInTheDocument();
    expect(screen.getByText('John Denver')).toBeInTheDocument();
    expect(screen.getByText('3:15')).toBeInTheDocument();
  });

  it('renders fallback name and simple song without optional fields', () => {
    render(
      <PerformanceViewer
        setlist={mockSetlistNamed}
        setlists={[mockSetlistNamed]}
        onSelectSetlist={vi.fn()}
        isAdmin={false}
        onNewSetlist={vi.fn()}
        onEditSetlist={vi.fn()}
        onDeleteSetlist={vi.fn()}
      />,
    );

    expect(screen.getAllByText('Fallback Named Setlist').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Simple Song')).toBeInTheDocument();
    expect(screen.getByTestId('song-leadsheet-link')).toBeInTheDocument();
    expect(screen.queryByTestId('song-play-link')).not.toBeInTheDocument();
  });

  it('renders admin buttons and triggers callbacks on click', () => {
    const onNewSetlist = vi.fn();
    const onEditSetlist = vi.fn();
    const onDeleteSetlist = vi.fn();

    render(
      <PerformanceViewer
        setlist={mockSetlist1}
        setlists={[mockSetlist1, mockSetlist2]}
        onSelectSetlist={vi.fn()}
        isAdmin={true}
        onNewSetlist={onNewSetlist}
        onEditSetlist={onEditSetlist}
        onDeleteSetlist={onDeleteSetlist}
      />,
    );

    const newBtn = screen.getByTestId('create-setlist-btn');
    const editBtn = screen.getByTestId('edit-setlist-btn');
    const deleteBtn = screen.getByTestId('delete-setlist-btn');

    fireEvent.click(newBtn);
    expect(onNewSetlist).toHaveBeenCalled();

    fireEvent.click(editBtn);
    expect(onEditSetlist).toHaveBeenCalledWith(mockSetlist1);

    fireEvent.click(deleteBtn);
    expect(onDeleteSetlist).toHaveBeenCalledWith(mockSetlist1);
  });

  it('renders empty items state when setlist has no songs', () => {
    const onEdit = vi.fn();
    render(
      <PerformanceViewer
        setlist={mockSetlist2}
        setlists={[mockSetlist1, mockSetlist2]}
        onSelectSetlist={vi.fn()}
        isAdmin={true}
        onNewSetlist={vi.fn()}
        onEditSetlist={onEdit}
        onDeleteSetlist={vi.fn()}
      />,
    );

    expect(screen.getByText('This setlist has no songs yet.')).toBeInTheDocument();
    const addSongsBtn = screen.getByRole('button', { name: /add songs/i });
    fireEvent.click(addSongsBtn);
    expect(onEdit).toHaveBeenCalledWith(mockSetlist2);
  });

  it('handles switching setlist from select dropdown', () => {
    const onSelectSetlist = vi.fn();
    render(
      <PerformanceViewer
        setlist={mockSetlist1}
        setlists={[mockSetlist1, mockSetlist2]}
        onSelectSetlist={onSelectSetlist}
        isAdmin={false}
        onNewSetlist={vi.fn()}
        onEditSetlist={vi.fn()}
        onDeleteSetlist={vi.fn()}
      />,
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    fireEvent.change(select, { target: { value: 'setlist-2' } });
    expect(onSelectSetlist).toHaveBeenCalledWith('setlist-2');
  });
});
