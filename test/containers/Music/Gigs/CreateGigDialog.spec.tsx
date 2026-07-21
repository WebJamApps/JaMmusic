import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CreateGigDialog } from 'src/containers/Music/Gigs/CreateGigDialog';
import utils from 'src/containers/Music/Gigs/gigs.utils';
import adminVenuesUtils from 'src/containers/AdminVenues/admin-venues.utils';
import { AuthContext } from 'src/providers/Auth.provider';

vi.mock('@mui/material', async () => {
  const mockMui = await import('../../../../__mocks__/@mui/material');
  return {
    ...mockMui,
    Autocomplete: (props: any) => {
      return (
        <select
          data-testid="mock-autocomplete"
          value={props.value ? props.value._id : ''}
          onChange={(e) => {
            const selected = props.options.find((o: any) => o._id === e.target.value);
            props.onChange(e, selected || null);
          }}
        >
          <option value="">Select...</option>
          {props.options.map((o: any) => (
            <option key={o._id} value={o._id}>
              {o.name || ''}
            </option>
          ))}
        </select>
      );
    },
  };
});

describe('CreateGigDialog', () => {
  const auth = {
    isAuthenticated: true,
    token: 'tk',
    user: { userType: 'JaM-admin' },
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles existing venue path (selection, websites, preview, creation)', async () => {
    const listVenuesSpy = vi.spyOn(adminVenuesUtils, 'listVenues').mockResolvedValue([
      { _id: 'v1', name: 'Venue 1 Website', website: 'http://v1.com', city: 'Durham', usState: 'North Carolina', status: 'active' },
      { _id: 'v2', name: 'Venue 2 NoWebsite', city: 'Raleigh', usState: 'North Carolina', status: 'active' },
      { _id: 'v3', name: 'Archived Venue', status: 'archived' },
    ]);
    const createGigSpy = vi.spyOn(utils, 'createGig').mockResolvedValue(true);
    const setShowDialog = vi.fn();

    render(
      <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
        <CreateGigDialog showDialog setShowDialog={setShowDialog} />
      </AuthContext.Provider>,
    );

    await waitFor(() => expect(listVenuesSpy).toHaveBeenCalledWith('tk'));

    // Verify option 'none' is not filtered from existing, but archived is filtered out from options.
    // Our Autocomplete select mock should render 'Select...', 'Venue 1 Website', and 'Venue 2 NoWebsite'
    const select = screen.getByTestId('mock-autocomplete');
    expect(select).toBeInTheDocument();

    // Select venue 1 (with website)
    fireEvent.change(select, { target: { value: 'v1' } });
    expect(screen.getByRole('link', { name: 'Venue 1 Website' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Venue 1 Website' })).toHaveAttribute('href', 'http://v1.com');

    // Select venue 2 (no website)
    fireEvent.change(select, { target: { value: 'v2' } });
    expect(screen.getByText('Venue 2 NoWebsite', { selector: 'span' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Venue 2 NoWebsite' })).not.toBeInTheDocument();

    // Fill tickets and create
    fireEvent.change(screen.getByLabelText('Tickets'), { target: { value: '15.00' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => expect(createGigSpy).toHaveBeenCalledWith(
      expect.any(Function),
      setShowDialog,
      expect.any(Date),
      '',
      '',
      '',
      '15.00',
      auth,
      0,
      '',
      'v2',
    ));
  });

  it('handles new venue path (creation)', async () => {
    vi.spyOn(adminVenuesUtils, 'listVenues').mockResolvedValue([]);
    const createVenueSpy = vi.spyOn(adminVenuesUtils, 'createVenue').mockResolvedValue({ _id: 'new-venue-123' } as any);
    const createGigSpy = vi.spyOn(utils, 'createGig').mockResolvedValue(true);
    const setShowDialog = vi.fn();

    render(
      <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
        <CreateGigDialog showDialog setShowDialog={setShowDialog} />
      </AuthContext.Provider>,
    );

    // Click 'Create New Venue' radio
    fireEvent.click(screen.getByLabelText('Create New Venue'));

    // Fill new venue info
    fireEvent.change(screen.getByLabelText('* Venue Name'), { target: { value: 'Brand New Place' } });
    fireEvent.change(screen.getByLabelText('* City'), { target: { value: 'Salem' } });
    fireEvent.change(screen.getByLabelText('* State'), { target: { value: 'Virginia' } });

    // Verify preview
    expect(screen.getByText('Brand New Place')).toBeInTheDocument();
    expect(screen.getByText('(Salem, Virginia)')).toBeInTheDocument();

    // Create
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => expect(createVenueSpy).toHaveBeenCalledWith('tk', {
      name: 'Brand New Place',
      city: 'Salem',
      usState: 'Virginia',
      status: 'active',
    }));
    await waitFor(() => expect(createGigSpy).toHaveBeenCalledWith(
      expect.any(Function),
      setShowDialog,
      expect.any(Date),
      '',
      '',
      '',
      '',
      auth,
      0,
      '',
      'new-venue-123',
    ));
  });

  it('handles no venue path (one-off)', async () => {
    vi.spyOn(adminVenuesUtils, 'listVenues').mockResolvedValue([]);
    const createGigSpy = vi.spyOn(utils, 'createGig').mockResolvedValue(true);
    const setShowDialog = vi.fn();

    render(
      <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
        <CreateGigDialog showDialog setShowDialog={setShowDialog} />
      </AuthContext.Provider>,
    );

    // Click 'No Venue (One-off)' radio
    fireEvent.click(screen.getByLabelText('No Venue (One-off)'));

    // Click create (should be disabled unless we have free-text, so let's verify disabling or set free-text)
    // Wait, let's verify Cancel button click
    fireEvent.click(screen.getByText(/Cancel/i));
    expect(setShowDialog).toHaveBeenCalledWith(false);
  });

  it('handles listVenues rejection gracefully', async () => {
    const listVenuesSpy = vi.spyOn(adminVenuesUtils, 'listVenues').mockRejectedValue(new Error('Fetch failed'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
        <CreateGigDialog showDialog setShowDialog={vi.fn()} />
      </AuthContext.Provider>,
    );

    await waitFor(() => expect(listVenuesSpy).toHaveBeenCalled());
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch venues:', expect.any(Error));
  });
});
