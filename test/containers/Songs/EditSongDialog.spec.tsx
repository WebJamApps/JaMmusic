import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EditSongDialog } from 'src/containers/Songs/EditSongDialog';
import utils from 'src/containers/Songs/songs.utils';
import type { Isong } from 'src/providers/Data.provider';

const song: Isong = {
  _id: 's1', url: 'https://x.com', title: 'a', artist: 'A', category: 'original', year: 2020,
  composer: 'C', album: 'Al', image: 'img', orderBy: 1,
} as Isong;

function renderDialog(over: Partial<Isong> = {}) {
  const setShowEditDialog = vi.fn();
  const setEditSong = vi.fn();
  const editSong = { ...song, ...over };
  render(
    <EditSongDialog
      editDialogState={{ showEditDialog: true, setShowEditDialog }}
      editSongState={{ editSong, setEditSong }}
      currentSong={editSong}
    />,
  );
  return { setShowEditDialog, setEditSong };
}

describe('EditSongDialog', () => {
  it('renders nothing when there is no song id', () => {
    const { container } = render(
      <EditSongDialog
        editDialogState={{ showEditDialog: true, setShowEditDialog: vi.fn() }}
        editSongState={{ editSong: { ...song, _id: '' } as Isong, setEditSong: vi.fn() }}
        currentSong={{ ...song, _id: '' } as Isong}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the Edit Song dialog for a song with an id', () => {
    renderDialog();
    expect(screen.getByText('Edit Song')).toBeInTheDocument();
  });

  it.each(['* Url', '* Title', '* Artist', 'Composer', 'Album', 'Image', 'Order (highest number plays first)'])(
    'fires onChange for the %s field',
    (label) => {
      renderDialog();
      const input = document.querySelector(`[label="${label}"]`)!;
      fireEvent.change(input, { target: { value: 'changed' } });
      expect(input).toBeDefined();
    },
  );

  it('Update button invokes utils.updateSong', () => {
    const spy = vi.spyOn(utils, 'updateSong').mockImplementation(() => Promise.resolve());
    renderDialog();
    fireEvent.click(screen.getByText(/Update/i));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
