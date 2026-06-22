/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EditVenueDialog } from 'src/containers/AdminVenues/EditVenueDialog';
import adminVenuesUtils, { type Ivenue } from 'src/containers/AdminVenues/admin-venues.utils';

const venue: Ivenue = {
  _id: 'v1', name: 'Mac n Bob', city: 'Salem', usState: 'VA', venueType: 'MidRangeCafeBar',
  bookingStatus: 'booking', outreachEligible: false, inScope: true, interested: true,
};

describe('EditVenueDialog', () => {
  beforeEach(() => {
    adminVenuesUtils.updateVenue = vi.fn(() => Promise.resolve({} as Ivenue)) as any;
  });

  it('saves the venue and calls onSaved', async () => {
    const onSaved = vi.fn();
    await act(async () => { render(<EditVenueDialog open venue={venue} token="tk" onClose={vi.fn()} onSaved={onSaved} />); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.objectContaining({
      name: 'Mac n Bob', bookingStatus: 'booking',
    }));
    expect(onSaved).toHaveBeenCalled();
  });

  it('propagates a toggled checkbox into the saved payload', async () => {
    await act(async () => { render(<EditVenueDialog open venue={venue} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />); });
    await act(async () => { fireEvent.click(screen.getByRole('checkbox', { name: /outreach eligible/i })); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.objectContaining({ outreachEligible: true }));
  });

  it('blocks save and shows an error when the name is empty', async () => {
    const blank: Ivenue = { ...venue, name: '' };
    await act(async () => { render(<EditVenueDialog open venue={blank} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(screen.getByTestId('edit-venue-error')).toBeDefined();
    expect(adminVenuesUtils.updateVenue).not.toHaveBeenCalled();
  });

  it('shows an error when the update rejects', async () => {
    adminVenuesUtils.updateVenue = vi.fn(() => Promise.reject(new Error('nope'))) as any;
    await act(async () => { render(<EditVenueDialog open venue={venue} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(screen.getByTestId('edit-venue-error').innerHTML).toBe('nope');
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    render(<EditVenueDialog open venue={venue} token="tk" onClose={onClose} onSaved={vi.fn()} />);
    fireEvent.click(screen.getByTestId('edit-venue-cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('does nothing on save when venue is null', async () => {
    render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(adminVenuesUtils.updateVenue).not.toHaveBeenCalled();
  });
});
