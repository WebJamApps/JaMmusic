import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateGigDialog } from 'src/containers/Music/Gigs/CreateGigDialog';
import utils from 'src/containers/Music/Gigs/gigs.utils';
import adminVenuesUtils from 'src/containers/AdminVenues/admin-venues.utils';
import { AuthContext } from 'src/providers/Auth.provider';

describe('CreateGigDialog', () => {
  it('renders and handles events', async () => {
    vi.spyOn(adminVenuesUtils, 'listVenues').mockResolvedValue([]);
    const createVenueSpy = vi.spyOn(adminVenuesUtils, 'createVenue').mockResolvedValue({ _id: 'new-venue-123' } as any);
    const spy = vi.spyOn(utils, 'createGig').mockResolvedValue();
    const setShowDialog = vi.fn();
    const auth = {
      isAuthenticated: true,
      token: 'tk',
      user: { userType: 'JaM-admin' },
    } as any;

    render(
      <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
        <CreateGigDialog showDialog setShowDialog={setShowDialog} />
      </AuthContext.Provider>,
    );

    // Switch path to 'new' (Create New Venue) so the inline creation inputs render
    fireEvent.click(screen.getByLabelText('Create New Venue'));

    // Fill out inline venue inputs
    fireEvent.change(screen.getByLabelText('* Venue Name'), { target: { value: 'Venue Name' } });
    fireEvent.change(screen.getByLabelText('* City'), { target: { value: 'city' } });
    fireEvent.change(screen.getByLabelText('* State'), { target: { value: 'Virginia' } });

    // Fill out general fields
    fireEvent.change(screen.getByLabelText('Tickets'), { target: { value: '10.00' } });
    fireEvent.change(document.querySelector('.createDatetime')!, { target: { value: '2025-01-01T12:00' } });

    // Click create button
    fireEvent.click(screen.getByRole('button', { name: /create/i }));
    await waitFor(() => expect(createVenueSpy).toHaveBeenCalled());
    await waitFor(() => expect(spy).toHaveBeenCalled());

    // Click cancel button
    fireEvent.click(screen.getByText(/Cancel/i));
    expect(setShowDialog).toHaveBeenCalledWith(false);
  });
});
