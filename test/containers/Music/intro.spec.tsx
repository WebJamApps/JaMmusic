import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ClickToListen } from 'src/containers/Music/intro';

describe('Intro', () => {
  it('renders ClickToListen when isAdmin and handles events', () => {
    const setShowCreatePic = vi.fn();
    const setShowEditPic = vi.fn();
    const props = {
      appName: 'app',
      isAdmin: true,
      setShowCreatePic,
      setShowEditPic,
    };
    render(<BrowserRouter><ClickToListen {...props} /></BrowserRouter>);

    const createButton = screen.getByText(/Add Pic/i);
    const editButton = screen.getByText(/Edit Pic/i);

    fireEvent.click(createButton);
    expect(setShowCreatePic).toHaveBeenCalledWith(true);
    fireEvent.click(editButton);
    expect(setShowEditPic).toHaveBeenCalledWith(true);
  });

  it('renders the Phil tip jar button and delegates to web-jam.com on joshandmariamusic.com', () => {
    window.open = vi.fn();
    const base = {
      isAdmin: false, setShowCreatePic: vi.fn(), setShowEditPic: vi.fn(),
    };

    const { rerender } = render(
      <BrowserRouter><ClickToListen {...base} appName="app" /></BrowserRouter>,
    );
    const philButton = screen.getByRole('button', { name: /Phil the Tip Jar/i });
    fireEvent.click(philButton);
    expect(window.open).not.toHaveBeenCalled();

    rerender(<BrowserRouter><ClickToListen {...base} appName="joshandmariamusic.com" /></BrowserRouter>);
    fireEvent.click(screen.getByRole('button', { name: /Phil the Tip Jar/i }));
    expect(window.open).toHaveBeenCalledWith('https://web-jam.com/music/tipjar');
  });
});
