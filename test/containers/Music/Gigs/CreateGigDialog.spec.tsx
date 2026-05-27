import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateGigDialog } from 'src/containers/Music/Gigs/CreateGigDialog';
import utils from 'src/containers/Music/Gigs/gigs.utils';
import { AuthContext } from 'src/providers/Auth.provider';

describe('CreateGigDialog', () => {
  it('renders and handles events', async () => {
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

    fireEvent.change(document.querySelector('input[label="* City"]')!, { target: { value: 'city' } });
    fireEvent.change(document.querySelector('#create-venue')!, { target: { value: 'Venue Name' } });
    fireEvent.change(document.querySelector('#create-us-state')!, { target: { value: 'Virginia' } });
    fireEvent.change(document.querySelector('input[label="Tickets"]')!, { target: { value: '10.00' } });

    fireEvent.change(document.querySelector('.createDatetime')!, { target: { value: '2025-01-01T12:00' } });

    fireEvent.click(screen.getByRole('button', { name: /create/i }));
    await waitFor(() => expect(spy).toHaveBeenCalled());

    fireEvent.click(screen.getByText(/Cancel/i));
    expect(setShowDialog).toHaveBeenCalledWith(false);
  });
});
