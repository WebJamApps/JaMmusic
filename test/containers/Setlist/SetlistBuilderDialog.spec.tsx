import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SetlistBuilderDialog } from 'src/containers/Setlist/SetlistBuilderDialog';
import { ISetlist } from 'src/containers/Setlist/setlist.utils';
import { Isong } from 'src/providers/Data.provider';

vi.mock('@mui/material', async () => {
  const mockMui = await import('../../../__mocks__/@mui/material');
  return {
    ...mockMui,
    Autocomplete: (props: any) => (
      <div data-testid={props['data-testid'] || 'mock-autocomplete-container'}>
        {props.renderInput && props.renderInput({})}
        <select
          data-testid="mock-autocomplete-select"
          value={props.value ? props.value._id : ''}
          onChange={(e) => {
            const selected = props.options.find((o: any) => o._id === e.target.value);
            props.onChange(e, selected || null);
          }}
        >
          <option value="">Select a song...</option>
          {props.options.map((o: any) => (
            <option key={o._id} value={o._id}>
              {props.getOptionLabel ? props.getOptionLabel(o) : o.title}
            </option>
          ))}
        </select>
      </div>
    ),
  };
});

const mockCatalog: Isong[] = [
  {
    _id: 'song-1',
    title: 'Peaceful Easy Feeling',
    artist: 'Eagles',
    category: 'cover',
    url: 'https://example.com/peaceful.mp3',
    year: 1972,
  },
  {
    _id: 'song-2',
    title: 'Acoustic Sunrise',
    artist: 'Josh & Maria Sherman',
    category: 'original',
    url: 'https://example.com/sunrise.mp3',
    year: 2024,
  },
];

const mockInitialSetlist: ISetlist = {
  _id: 'setlist-edit-1',
  title: 'Existing Setlist',
  description: 'Old Description',
  gigDate: '2026-10-15',
  items: [
    {
      order: 1,
      title: 'First Song',
      artist: 'Artist One',
      key: 'D',
      durationSeconds: 180,
      capo: '2',
      tempo: '120',
      notes: 'Initial note',
      leadSheetUrl: 'https://tabs.com/1',
      playLink: 'https://audio.com/1.mp3',
    },
    {
      order: 2,
      songId: {
        _id: 'song-2',
        title: 'Acoustic Sunrise',
        artist: 'Josh & Maria Sherman',
      },
      durationSeconds: 200,
    },
  ],
};

describe('SetlistBuilderDialog', () => {
  it('renders create mode with empty fields', () => {
    render(
      <SetlistBuilderDialog
        open={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        songCatalog={mockCatalog}
      />,
    );

    expect(screen.getByText('Create New Setlist')).toBeInTheDocument();
    const titleInput = screen.getByTestId('setlist-title-input') as HTMLInputElement;
    expect(titleInput.value).toBe('');
    expect(screen.getByText(/No songs added yet/i)).toBeInTheDocument();
  });

  it('renders edit mode with initial setlist data and handles header close button', () => {
    const onClose = vi.fn();
    render(
      <SetlistBuilderDialog
        open={true}
        onClose={onClose}
        onSave={vi.fn()}
        initialSetlist={mockInitialSetlist}
        songCatalog={mockCatalog}
      />,
    );

    expect(screen.getByText('Edit Setlist')).toBeInTheDocument();
    const titleInput = screen.getByTestId('setlist-title-input') as HTMLInputElement;
    expect(titleInput.value).toBe('Existing Setlist');
    expect(screen.getByText('First Song')).toBeInTheDocument();
    expect(screen.getByText('Acoustic Sunrise')).toBeInTheDocument();

    const closeBtn = screen.getByTestId('close-builder-btn');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('shows error if saving without title', async () => {
    render(
      <SetlistBuilderDialog
        open={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        songCatalog={mockCatalog}
      />,
    );

    // Enter description only
    const descInput = screen.getByTestId('setlist-description-input');
    fireEvent.change(descInput, { target: { value: 'Some description' } });

    // The save button is disabled when title is empty
    const saveBtn = screen.getByTestId('save-setlist-btn');
    expect(saveBtn).toBeDisabled();
  });

  it('switches between catalog tab and custom song tab', () => {
    render(
      <SetlistBuilderDialog
        open={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        songCatalog={mockCatalog}
      />,
    );

    expect(screen.getByTestId('mock-autocomplete-select')).toBeInTheDocument();

    const customTab = screen.getByTestId('tab-custom-song');
    fireEvent.click(customTab);

    expect(screen.getByTestId('custom-song-title-input')).toBeInTheDocument();
  });

  it('adds catalog song to setlist', () => {
    render(
      <SetlistBuilderDialog
        open={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        songCatalog={mockCatalog}
      />,
    );

    const autoSelect = screen.getByTestId('mock-autocomplete-select');
    fireEvent.change(autoSelect, { target: { value: 'song-1' } });

    const addBtn = screen.getByTestId('add-catalog-song-btn');
    expect(addBtn).not.toBeDisabled();
    fireEvent.click(addBtn);

    expect(screen.getByText('Peaceful Easy Feeling')).toBeInTheDocument();
    expect(screen.getByText('Eagles')).toBeInTheDocument();
  });

  it('adds custom song to setlist', () => {
    render(
      <SetlistBuilderDialog
        open={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        songCatalog={mockCatalog}
      />,
    );

    const customTab = screen.getByTestId('tab-custom-song');
    fireEvent.click(customTab);

    fireEvent.change(screen.getByTestId('custom-song-title-input'), { target: { value: 'Wagon Wheel' } });
    fireEvent.change(screen.getByTestId('custom-song-artist-input'), { target: { value: 'Darius Rucker' } });
    fireEvent.change(screen.getByTestId('custom-song-key-input'), { target: { value: 'A' } });
    fireEvent.change(screen.getByTestId('custom-song-capo-input'), { target: { value: '2' } });
    fireEvent.change(screen.getByTestId('custom-song-tempo-input'), { target: { value: '110' } });
    fireEvent.change(screen.getByTestId('custom-song-duration-input'), { target: { value: '3:45' } });
    fireEvent.change(screen.getByTestId('custom-song-notes-input'), { target: { value: 'Acoustic rhythm intro' } });
    fireEvent.change(screen.getByTestId('custom-song-leadsheet-input'), { target: { value: 'https://tabs.com/wagon' } });
    fireEvent.change(screen.getByTestId('custom-song-playlink-input'), { target: { value: 'https://music.com/wagon.mp3' } });

    const addBtn = screen.getByTestId('add-custom-song-btn');
    fireEvent.click(addBtn);

    expect(screen.getByText('Wagon Wheel')).toBeInTheDocument();
    expect(screen.getByText('Darius Rucker')).toBeInTheDocument();
    expect(screen.getByText('Key: A')).toBeInTheDocument();
    expect(screen.getByText('Capo 2')).toBeInTheDocument();
    expect(screen.getByText('110 BPM')).toBeInTheDocument();
  });

  it('shows error if trying to add custom song with empty title', () => {
    render(
      <SetlistBuilderDialog
        open={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        songCatalog={mockCatalog}
      />,
    );

    const customTab = screen.getByTestId('tab-custom-song');
    fireEvent.click(customTab);

    // With empty title, button is disabled
    const addBtn = screen.getByTestId('add-custom-song-btn');
    expect(addBtn).toBeDisabled();
  });

  it('reorders and removes songs in the builder', () => {
    render(
      <SetlistBuilderDialog
        open={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        initialSetlist={mockInitialSetlist}
        songCatalog={mockCatalog}
      />,
    );

    // Initial items: #1 First Song, #2 Acoustic Sunrise
    const moveDownBtn1 = screen.getByTestId('move-down-btn-1');
    const moveUpBtn1 = screen.getByTestId('move-up-btn-1');
    const moveUpBtn2 = screen.getByTestId('move-up-btn-2');

    // First item cannot move up
    expect(moveUpBtn1).toBeDisabled();
    // First item can move down
    expect(moveDownBtn1).not.toBeDisabled();

    // Click move down on item 1
    fireEvent.click(moveDownBtn1);

    // Now item 1 should be Acoustic Sunrise, item 2 should be First Song
    const items = screen.getAllByTestId(/builder-item-/);
    expect(items[0]).toHaveTextContent('Acoustic Sunrise');
    expect(items[1]).toHaveTextContent('First Song');

    // Move item 2 up
    fireEvent.click(screen.getByTestId('move-up-btn-2'));
    const itemsAfterMoveUp = screen.getAllByTestId(/builder-item-/);
    expect(itemsAfterMoveUp[0]).toHaveTextContent('First Song');

    // Remove first item
    const removeBtn = screen.getByTestId('remove-item-btn-1');
    fireEvent.click(removeBtn);

    expect(screen.queryByText('First Song')).not.toBeInTheDocument();
    expect(screen.getByText('Acoustic Sunrise')).toBeInTheDocument();
  });

  it('edits existing song details via sub-dialog and can cancel edit', async () => {
    render(
      <SetlistBuilderDialog
        open={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        initialSetlist={mockInitialSetlist}
        songCatalog={mockCatalog}
      />,
    );

    // Open edit dialog and cancel
    const editBtn1 = screen.getByTestId('edit-item-btn-1');
    fireEvent.click(editBtn1);
    expect(screen.getByTestId('edit-item-dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('cancel-edit-item-btn'));
    await waitFor(() => {
      expect(screen.queryByTestId('edit-item-dialog')).not.toBeInTheDocument();
    });

    // Reopen and edit all fields
    fireEvent.click(editBtn1);
    expect(screen.getByTestId('edit-item-dialog')).toBeInTheDocument();

    fireEvent.change(screen.getByTestId('edit-item-title-input'), { target: { value: 'First Song (Updated)' } });
    fireEvent.change(screen.getByTestId('edit-item-artist-input'), { target: { value: 'Updated Artist' } });
    fireEvent.change(screen.getByTestId('edit-item-key-input'), { target: { value: 'E' } });
    fireEvent.change(screen.getByTestId('edit-item-capo-input'), { target: { value: '3' } });
    fireEvent.change(screen.getByTestId('edit-item-tempo-input'), { target: { value: '140' } });
    fireEvent.change(screen.getByTestId('edit-item-duration-input'), { target: { value: '4:10' } });
    fireEvent.change(screen.getByTestId('edit-item-leadsheet-input'), { target: { value: 'https://tabs.com/updated' } });
    fireEvent.change(screen.getByTestId('edit-item-playlink-input'), { target: { value: 'https://audio.com/updated.mp3' } });
    fireEvent.change(screen.getByTestId('edit-item-notes-input'), { target: { value: 'Updated stage note' } });

    const saveEditBtn = screen.getByTestId('save-edit-item-btn');
    fireEvent.click(saveEditBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('edit-item-dialog')).not.toBeInTheDocument();
    });

    expect(screen.getByText('First Song (Updated)')).toBeInTheDocument();
    expect(screen.getByText('Updated Artist')).toBeInTheDocument();
    expect(screen.getByText('Key: E')).toBeInTheDocument();
    expect(screen.getByText('Capo 3')).toBeInTheDocument();
    expect(screen.getByText('140 BPM')).toBeInTheDocument();
    expect(screen.getByText('4:10')).toBeInTheDocument();
  });

  it('saves setlist and calls onSave and onClose', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <SetlistBuilderDialog
        open={true}
        onClose={onClose}
        onSave={onSave}
        initialSetlist={mockInitialSetlist}
        songCatalog={mockCatalog}
      />,
    );

    const titleInput = screen.getByTestId('setlist-title-input');
    fireEvent.change(titleInput, { target: { value: 'Updated Setlist Title' } });
    fireEvent.change(screen.getByTestId('setlist-gig-date-input'), { target: { value: '2026-11-01' } });

    const saveBtn = screen.getByTestId('save-setlist-btn');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Setlist Title',
          name: 'Updated Setlist Title',
          gigDate: '2026-11-01',
        }),
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('handles cancel button click', () => {
    const onClose = vi.fn();
    render(
      <SetlistBuilderDialog
        open={true}
        onClose={onClose}
        onSave={vi.fn()}
        songCatalog={mockCatalog}
      />,
    );

    const cancelBtn = screen.getByTestId('cancel-builder-btn');
    fireEvent.click(cancelBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
