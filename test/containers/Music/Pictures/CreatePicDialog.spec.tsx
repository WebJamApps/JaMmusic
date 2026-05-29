import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  CreatePicDialog,
  // makeShowHideCaption
} from 'src/containers/Music/Pictures/CreatePicDialog';
import utils from 'src/containers/Music/Pictures/pictures.utils';

describe('CreatePicDialog', () => {
  it('renders correctly and handles events', () => {
    utils.createPic = vi.fn();
    const setShowDialog = vi.fn();
    const { container } = render(<CreatePicDialog showDialog setShowDialog={setShowDialog} />);

    const cancelButton = screen.getByText(/Cancel/i);
    fireEvent.click(cancelButton);
    expect(setShowDialog).toHaveBeenCalledWith(false);

    fireEvent.change(container.querySelector('input[label="* URL"]')!, { target: { value: 'value' } });
    fireEvent.change(container.querySelector('input[label="* Title"]')!, { target: { value: 'title' } });

    fireEvent.click(screen.getByRole('button', { name: /^Create$/ }));
    expect(utils.createPic).toHaveBeenCalled();
  });
  // it('makeShowHideCaption and runs it', () => {
  //   const setPic = jest.fn();
  //   const showHide = makeShowHideCaption(setPic, {} as any);
  //   showHide({ target: { checked: true } });
  //   expect(setPic).toHaveBeenCalledWith({ comments: 'showCaption' });
  //   showHide({ target: { checked: false } });
  //   expect(setPic).toHaveBeenCalledWith({ comments: '' });
  // });
});
