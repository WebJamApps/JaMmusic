import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditPicDialog } from 'src/containers/Music/Pictures/EditPicDialog';
import utils from 'src/containers/Music/Pictures/pictures.utils';

describe('EditPicDialog', () => {
  it('handles onChange with url', () => {
    const props = {
      editPic: {
        title: '', type: '', comments: '', url: '', _id: undefined,
      },
      setShowTable: vi.fn(),
      setEditPic: vi.fn(),
    };
    const { container } = render(<EditPicDialog {...props} />);
    const urlInput = container.querySelector('input[label="* URL"]')!;
    fireEvent.change(urlInput, { target: { value: 'url' } });
    expect(props.setEditPic).toHaveBeenCalled();
  });
  it('handles onChange with title', () => {
    const props = {
      editPic: {
        title: '', type: '', comments: '', url: '', _id: undefined,
      },
      setShowTable: vi.fn(),
      setEditPic: vi.fn(),
    };
    const { container } = render(<EditPicDialog {...props} />);
    const titleInput = container.querySelector('input[label="* Title"]')!;
    fireEvent.change(titleInput, { target: { value: 'title' } });
    expect(props.setEditPic).toHaveBeenCalled();
  });
  it('handles onClick with updatePic', () => {
    const props = {
      editPic: {
        title: 'title', type: '', comments: '', url: 'url', _id: '123',
      },
      setShowTable: vi.fn(),
      setEditPic: vi.fn(),
    };
    utils.updatePic = vi.fn();
    render(<EditPicDialog {...props} />);
    fireEvent.click(screen.getByText(/Update/i));
    expect(utils.updatePic).toHaveBeenCalled();
  });
  it('handles onClick with deletePic', () => {
    const props = {
      editPic: {
        title: '', type: '', comments: '', url: '', _id: undefined,
      },
      setShowTable: vi.fn(),
      setEditPic: vi.fn(),
    };
    utils.deletePic = vi.fn();
    render(<EditPicDialog {...props} />);
    fireEvent.click(screen.getByText(/Delete/i));
    expect(utils.deletePic).toHaveBeenCalled();
  });
  it('handles onClick with setEditPic', () => {
    const props = {
      editPic: {
        title: '', type: '', comments: '', url: '', _id: undefined,
      },
      setShowTable: vi.fn(),
      setEditPic: vi.fn(),
    };
    render(<EditPicDialog {...props} />);
    fireEvent.click(screen.getByText(/Cancel/i));
    expect(props.setEditPic).toHaveBeenCalled();
  });
});
