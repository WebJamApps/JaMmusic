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
});
