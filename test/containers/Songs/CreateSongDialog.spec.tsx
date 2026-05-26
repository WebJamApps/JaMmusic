import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateSongDialog } from 'src/containers/Songs/CreateSongDialog';

describe('CreateSongDialog', () => {
  it('handles onClose for CreateSongDialog', () => {
    const showDialog = true;
    const setShowDialog = vi.fn();
    render(<CreateSongDialog showDialog={showDialog} setShowDialog={setShowDialog} />);
    fireEvent.click(screen.getByText(/Cancel/i));
    expect(setShowDialog).toHaveBeenCalledWith(false);
  });
  it('handles onChange with url', () => {
    const showDialog = true;
    const setShowDialog = vi.fn();
    render(<CreateSongDialog showDialog={showDialog} setShowDialog={setShowDialog} />);
    const input = screen.getByLabelText(/\* Url/i);
    fireEvent.change(input, { target: { value: 'song' } });
    expect(input).toBeDefined();
  });
  it('handles onChange with title', () => {
    const showDialog = true;
    const setShowDialog = vi.fn();
    render(<CreateSongDialog showDialog={showDialog} setShowDialog={setShowDialog} />);
    const input = screen.getByLabelText(/\* Title/i);
    fireEvent.change(input, { target: { value: 'title' } });
    expect(input).toBeDefined();
  });
  it('handles onChange with artist', () => {
    const showDialog = true;
    const setShowDialog = vi.fn();
    render(<CreateSongDialog showDialog={showDialog} setShowDialog={setShowDialog} />);
    const input = screen.getByLabelText(/\* Artist/i);
    fireEvent.change(input, { target: { value: 'artist' } });
    expect(input).toBeDefined();
  });
  it('handles onChange with category', () => {
    const showDialog = true;
    const setShowDialog = vi.fn();
    render(<CreateSongDialog showDialog={showDialog} setShowDialog={setShowDialog} />);
    const input = screen.getByLabelText(/Category/i);
    fireEvent.change(input, { target: { value: 'category' } });
    expect(input).toBeDefined();
  });
  it('handles onChange with composer', () => {
    const showDialog = true;
    const setShowDialog = vi.fn();
    render(<CreateSongDialog showDialog={showDialog} setShowDialog={setShowDialog} />);
    const input = screen.getByLabelText(/Composer/i);
    fireEvent.change(input, { target: { value: 'composer' } });
    expect(input).toBeDefined();
  });
  it('handles onChange with album', () => {
    const showDialog = true;
    const setShowDialog = vi.fn();
    render(<CreateSongDialog showDialog={showDialog} setShowDialog={setShowDialog} />);
    const input = screen.getByLabelText(/Album/i);
    fireEvent.change(input, { target: { value: 'album' } });
    expect(input).toBeDefined();
  });
  it('handles onChange with image', () => {
    const showDialog = true;
    const setShowDialog = vi.fn();
    render(<CreateSongDialog showDialog={showDialog} setShowDialog={setShowDialog} />);
    const input = screen.getByLabelText(/Image/i);
    fireEvent.change(input, { target: { value: 'image' } });
    expect(input).toBeDefined();
  });
  it('handles onChange with year', () => {
    const showDialog = true;
    const setShowDialog = vi.fn();
    render(<CreateSongDialog showDialog={showDialog} setShowDialog={setShowDialog} />);
    const input = screen.getByLabelText(/\* Year/i);
    fireEvent.change(input, { target: { value: '2' } });
    expect(input).toBeDefined();
  });
  it('handles onChange with orderBy', () => {
    const showDialog = true;
    const setShowDialog = vi.fn();
    render(<CreateSongDialog showDialog={showDialog} setShowDialog={setShowDialog} />);
    const input = screen.getByPlaceholderText(/Order/i);
    fireEvent.change(input, { target: { value: '2' } });
    expect(input).toBeDefined();
  });
});
