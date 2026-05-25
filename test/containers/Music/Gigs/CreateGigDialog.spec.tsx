import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateGigDialog } from 'src/containers/Music/Gigs/CreateGigDialog';
import utils from 'src/containers/Music/Gigs/gigs.utils';

describe('CreateGigDialog', () => {
  it('renders and handles events', () => {
    const spy = vi.spyOn(utils, 'createGig').mockResolvedValue();
    const setShowDialog = vi.fn();
    const { container } = render(<CreateGigDialog showDialog setShowDialog={setShowDialog} />);

    fireEvent.change(container.querySelector('input[label="* City"]')!, { target: { value: 'city' } });

    fireEvent.change(container.querySelector('input[label="Tickets"]')!, { target: { value: 'tickets' } });

    fireEvent.change(container.querySelector('#create-venue')!, { target: { value: 'Venue Name' } });

    fireEvent.change(container.querySelector('#create-us-state')!, { target: { value: 'Virginia' } });

    const dateInput = container.querySelector('.createDatetime')!;
    fireEvent.change(dateInput, { target: { value: '2025-01-01T12:00' } });

    fireEvent.click(screen.getByText(/Cancel/i));
    expect(setShowDialog).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByRole('button', { name: /create/i }));
    expect(spy).toHaveBeenCalled();
  });
});
