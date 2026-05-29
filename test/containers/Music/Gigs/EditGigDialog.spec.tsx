import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  ButtonsSection, EditGigDialog, EditText, VenueEditor,
} from 'src/containers/Music/Gigs/EditGigDialog';
import utils from 'src/containers/Music/Gigs/gigs.utils';
import { defaultGig } from 'src/providers/fetchGigs';

describe('EditGigDialog', () => {
  it('renders and handles events', () => {
    const props = {
      editGig: { _id: '123', venue: 'v', city: 'c', usState: 's', datetime: '2025-01-01' } as any,
      setEditGig: vi.fn(),
      setShowDialog: vi.fn(),
      setEditChanged: vi.fn(),
      editChanged: false,
      getGigs: vi.fn(),
      auth: { token: 'some-token' } as any,
    };
    render(<EditGigDialog {...props} />);
    // Target the specific cancel button that closes the dialog
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(props.setEditGig).toHaveBeenCalledWith(defaultGig);
  });
  it('renders ButtonSection and handles clicks', () => {
    const updateSpy = vi.spyOn(utils, 'updateGig').mockResolvedValue();
    const deleteSpy = vi.spyOn(utils, 'deleteGig').mockResolvedValue(true);
    const props = {
      editGig: { _id: '123', venue: 'v', city: 'c', usState: 's', datetime: '2025-01-01' } as any,
      editChanged: true,
      getGigs: vi.fn(),
      setEditGig: vi.fn(),
      setEditChanged: vi.fn(),
      auth: { token: 'some-token' } as any,
    };
    render(<ButtonsSection {...props} />);
    fireEvent.click(screen.getByText(/Update/i));
    expect(updateSpy).toHaveBeenCalled();
    fireEvent.click(screen.getByText(/Delete/i));
    expect(deleteSpy).toHaveBeenCalled();
  });
  it('renders the VenueEditor and handles event', () => {
    const props = {
      editGig: { _id: 'uuid' } as any, setEditChanged: vi.fn(), setEditGig: vi.fn(),
    };
    const { container } = render(<VenueEditor {...props} />);
    expect(container.querySelector('#edit-venue')).toBeInTheDocument();
  });
  it('renders EditText and handles onChange', () => {
    const props = {
      objKey: 'tickets' as any, editGig: {} as any, setEditChanged: vi.fn(), setEditGig: vi.fn(), required: true,
    };
    render(<EditText {...props} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'value' } });
    expect(props.setEditGig).toHaveBeenCalled();
  });
});
