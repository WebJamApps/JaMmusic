import { vi } from 'vitest';
import { Player, SongButtons, Songs } from 'src/containers/Songs';
import { render, screen, fireEvent } from '@testing-library/react';
import { Isong } from 'src/providers/Data.provider';
import { BrowserRouter } from 'react-router-dom';

describe('Songs', () => {
  it('renders correctly', () => {
    const { container } = render(<Songs />);
    expect(container.firstChild).toHaveClass('page-content');
  });
  it('renders with SongButtons', () => {
    const isAdmin = true;
    const setShow = vi.fn();
    render(<SongButtons isAdmin={isAdmin} setShowCreateSong={setShow} setShowEditDialog={vi.fn()} />);
    expect(screen.getByRole('button', { name: /create song/i })).toBeInTheDocument();
  });
  it('handles onClick', () => {
    const props = { isAdmin: true, setShowCreateSong: vi.fn(), setShowEditDialog: vi.fn() };
    render(<SongButtons {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /create song/i }));
    expect(props.setShowCreateSong).toHaveBeenCalled();
  });
  it('renders Player', () => {
    const songs: any = [{
      category: 'originals', title: 'a', year: 12, url: 'https://test1.com',
    }, {
      category: 'originals', title: 'b', year: 13, url: 'https://test2.com',
    }] as Isong[];
    const editDialogState = { setShowEditDialog: vi.fn(), showEditDialog: false };
    render(<BrowserRouter><Player songs={songs} editDialogState={editDialogState} /></BrowserRouter>);
    expect(screen.getByText('a')).toBeInTheDocument();
  });
});
