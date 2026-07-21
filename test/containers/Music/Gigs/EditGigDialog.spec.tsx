import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EditGigDialog, EditText } from 'src/containers/Music/Gigs/EditGigDialog';
import utils from 'src/containers/Music/Gigs/gigs.utils';
import adminVenuesUtils from 'src/containers/AdminVenues/admin-venues.utils';
import { defaultGig } from 'src/providers/fetchGigs';

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

describe('EditGigDialog', () => {
  const activeVenues = [
    { _id: 'v1', name: 'Venue 1 Website', website: 'http://v1.com', city: 'Durham', usState: 'North Carolina', status: 'active' },
    { _id: 'v2', name: 'Venue 2 NoWebsite', city: 'Raleigh', usState: 'North Carolina', status: 'active' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when editGig._id is not set', () => {
    const { container } = render(
      <EditGigDialog
        editGig={defaultGig}
        setEditGig={vi.fn()}
        setShowDialog={vi.fn()}
        setEditChanged={vi.fn()}
        editChanged={false}
        getGigs={vi.fn()}
        auth={{ token: 'tk' } as any}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('handles existing venue path (initial match, website rendering, update)', async () => {
    const listVenuesSpy = vi.spyOn(adminVenuesUtils, 'listVenues').mockResolvedValue(activeVenues);
    const updateSpy = vi.spyOn(utils, 'updateGig').mockResolvedValue(true);
    const setEditGig = vi.fn();
    const setShowDialog = vi.fn();

    const editGig = {
      _id: 'gig123',
      datetime: new Date('2025-01-01T12:00:00Z'),
      venue: '',
      venueId: 'v1', // existing venue id
    } as any;

    render(
      <EditGigDialog
        editGig={editGig}
        setEditGig={setEditGig}
        setShowDialog={setShowDialog}
        setEditChanged={vi.fn()}
        editChanged={true}
        getGigs={vi.fn()}
        auth={{ token: 'tk' } as any}
      />,
    );

    await waitFor(() => expect(listVenuesSpy).toHaveBeenCalledWith('tk'));

    // Path should start as 'existing' because venueId was set
    expect(screen.getByLabelText('Pick Existing Venue')).toBeChecked();

    // Verify initial selected venue preview (with website)
    expect(screen.getByRole('link', { name: 'Venue 1 Website' })).toHaveAttribute('href', 'http://v1.com');

    // Change autocomplete selection to v2
    const select = screen.getByTestId('mock-autocomplete');
    fireEvent.change(select, { target: { value: 'v2' } });

    // Verify preview changes to v2 (no website)
    expect(screen.getByText('Venue 2 NoWebsite', { selector: 'span' })).toBeInTheDocument();

    // Click Update
    fireEvent.click(screen.getByRole('button', { name: /update/i }));

    await waitFor(() => expect(updateSpy).toHaveBeenCalledWith(
      expect.any(Function),
      setEditGig,
      expect.any(Function),
      expect.objectContaining({
        venueId: 'v2',
      }),
      'tk',
    ));
    expect(setShowDialog).toHaveBeenCalledWith(false);
  });

  it('handles new inline venue path (creation and update)', async () => {
    vi.spyOn(adminVenuesUtils, 'listVenues').mockResolvedValue(activeVenues);
    const createVenueSpy = vi.spyOn(adminVenuesUtils, 'createVenue').mockResolvedValue({ _id: 'new-venue-123' } as any);
    const updateSpy = vi.spyOn(utils, 'updateGig').mockResolvedValue(true);

    const editGig = {
      _id: 'gig123',
      datetime: new Date('2025-01-01T12:00:00Z'),
      venue: '',
    } as any;

    render(
      <EditGigDialog
        editGig={editGig}
        setEditGig={vi.fn()}
        setShowDialog={vi.fn()}
        setEditChanged={vi.fn()}
        editChanged={true}
        getGigs={vi.fn()}
        auth={{ token: 'tk' } as any}
      />,
    );

    await waitFor(() => expect(screen.getByLabelText('Create New Venue')).toBeInTheDocument());

    // Switch to new venue path
    fireEvent.click(screen.getByLabelText('Create New Venue'));

    // Fill inline details
    fireEvent.change(screen.getByLabelText('* Venue Name'), { target: { value: 'New Spot' } });
    fireEvent.change(screen.getByLabelText('* City'), { target: { value: 'Roanoke' } });
    fireEvent.change(screen.getByLabelText('* State'), { target: { value: 'Virginia' } });

    // Verify preview
    expect(screen.getByText('New Spot')).toBeInTheDocument();
    expect(screen.getByText('(Roanoke, Virginia)')).toBeInTheDocument();

    // Click Update
    fireEvent.click(screen.getByRole('button', { name: /update/i }));

    await waitFor(() => expect(createVenueSpy).toHaveBeenCalledWith('tk', {
      name: 'New Spot',
      city: 'Roanoke',
      usState: 'Virginia',
      status: 'active',
    }));
    await waitFor(() => expect(updateSpy).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({
        venueId: 'new-venue-123',
      }),
      'tk',
    ));
  });

  it('handles no venue path (one-off selection & clear selected venue)', async () => {
    vi.spyOn(adminVenuesUtils, 'listVenues').mockResolvedValue(activeVenues);
    const updateSpy = vi.spyOn(utils, 'updateGig').mockResolvedValue(true);

    const editGig = {
      _id: 'gig123',
      datetime: new Date('2025-01-01T12:00:00Z'),
      venue: 'My Free Text Venue',
      venueId: 'v1',
    } as any;

    render(
      <EditGigDialog
        editGig={editGig}
        setEditGig={vi.fn()}
        setShowDialog={vi.fn()}
        setEditChanged={vi.fn()}
        editChanged={true}
        getGigs={vi.fn()}
        auth={{ token: 'tk' } as any}
      />,
    );

    await waitFor(() => expect(screen.getByLabelText('No Venue (One-off)')).toBeInTheDocument());

    // Switch to No Venue
    fireEvent.click(screen.getByLabelText('No Venue (One-off)'));

    // Click Update
    fireEvent.click(screen.getByRole('button', { name: /update/i }));

    await waitFor(() => expect(updateSpy).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({
        venueId: undefined,
      }),
      'tk',
    ));
  });

  it('handles delete and cancel clicks', async () => {
    vi.spyOn(adminVenuesUtils, 'listVenues').mockResolvedValue([]);
    const deleteSpy = vi.spyOn(utils, 'deleteGig').mockResolvedValue(true);
    const setEditGig = vi.fn();
    const setShowDialog = vi.fn();

    const editGig = {
      _id: 'gig123',
      datetime: new Date('2025-01-01T12:00:00Z'),
      venue: 'v',
    } as any;

    render(
      <EditGigDialog
        editGig={editGig}
        setEditGig={setEditGig}
        setShowDialog={setShowDialog}
        setEditChanged={vi.fn()}
        editChanged={false}
        getGigs={vi.fn()}
        auth={{ token: 'tk' } as any}
      />,
    );

    // Cancel click
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(setEditGig).toHaveBeenCalledWith(defaultGig);

    // Delete click
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(deleteSpy).toHaveBeenCalled();
  });

  it('handles listVenues rejection gracefully', async () => {
    const listVenuesSpy = vi.spyOn(adminVenuesUtils, 'listVenues').mockRejectedValue(new Error('Fetch failed'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <EditGigDialog
        editGig={{ _id: 'gig123', datetime: new Date() } as any}
        setEditGig={vi.fn()}
        setShowDialog={vi.fn()}
        setEditChanged={vi.fn()}
        editChanged={false}
        getGigs={vi.fn()}
        auth={{ token: 'tk' } as any}
      />,
    );

    await waitFor(() => expect(listVenuesSpy).toHaveBeenCalled());
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch venues:', expect.any(Error));
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
