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

  it('saves the relationshipStage + templateOverride selections (#1136)', async () => {
    await act(async () => { render(<EditVenueDialog open venue={venue} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />); });
    await act(async () => { fireEvent.change(screen.getByTestId('edit-venue-stage'), { target: { value: 'returning' } }); });
    await act(async () => { fireEvent.change(screen.getByTestId('edit-venue-override'), { target: { value: 'MidRangeCafeBar' } }); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.objectContaining({
      relationshipStage: 'returning', templateOverride: 'MidRangeCafeBar',
    }));
  });

  it('saves the originalsFit, travelBand and priority ranking fields', async () => {
    await act(async () => { render(<EditVenueDialog open venue={venue} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />); });
    await act(async () => { fireEvent.change(screen.getByTestId('edit-venue-originals'), { target: { value: 'loves' } }); });
    await act(async () => { fireEvent.change(screen.getByTestId('edit-venue-travel'), { target: { value: 'regional' } }); });
    await act(async () => { fireEvent.change(screen.getByTestId('edit-venue-priority'), { target: { value: '4' } }); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.objectContaining({
      originalsFit: 'loves', travelBand: 'regional', priority: 4,
    }));
  });

  it('propagates a toggled checkbox into the saved payload', async () => {
    await act(async () => { render(<EditVenueDialog open venue={venue} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />); });
    await act(async () => { fireEvent.click(screen.getByRole('checkbox', { name: /outreach eligible/i })); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.objectContaining({ outreachEligible: true }));
  });

  it('edits the text/contact fields and toggles into the saved payload', async () => {
    await act(async () => { render(<EditVenueDialog open venue={venue} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />); });
    const change = (testid: string, value: string) => fireEvent.change(screen.getByTestId(testid), { target: { value } });
    await act(async () => {
      change('edit-venue-city', 'Roanoke');
      change('edit-venue-state', 'VA');
      change('edit-venue-type', 'Originals');
      change('edit-venue-contact', 'Pat');
      change('edit-venue-email', 'pat@v.com');
      change('edit-venue-phone', '540-555-1212');
      change('edit-venue-website', 'https://v.com');
      change('edit-venue-pay', '$$$');
      change('edit-venue-notes', 'great room');
    });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-inscope')); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-interested')); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-contactverified')); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.objectContaining({
      city: 'Roanoke', usState: 'VA', venueType: 'Originals', contactName: 'Pat',
      email: 'pat@v.com', phone: '540-555-1212', website: 'https://v.com', payTier: '$$$', notes: 'great room',
    }));
  });

  it('clears priority back to undefined when emptied', async () => {
    await act(async () => {
      render(<EditVenueDialog open venue={{ ...venue, priority: 3 }} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    await act(async () => { fireEvent.change(screen.getByTestId('edit-venue-priority'), { target: { value: '' } }); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.objectContaining({ priority: undefined }));
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

  it('creates a new venue when venue is null', async () => {
    adminVenuesUtils.createVenue = vi.fn(() => Promise.resolve({} as Ivenue)) as any;
    const onSaved = vi.fn();
    await act(async () => {
      render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={onSaved} />);
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-venue-name'), { target: { value: 'New Cafe' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(adminVenuesUtils.createVenue).toHaveBeenCalledWith('tk', expect.objectContaining({
      name: 'New Cafe',
    }));
    expect(onSaved).toHaveBeenCalled();
  });

  it('warns on duplicate venue name and cancels save if user rejects confirm', async () => {
    adminVenuesUtils.createVenue = vi.fn(() => Promise.resolve({} as Ivenue)) as any;
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const existing: Ivenue[] = [{ _id: 'v1', name: 'Existing Venue' }];
    await act(async () => {
      render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={vi.fn()} existingVenues={existing} />);
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-venue-name'), { target: { value: 'existing venue' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(confirmSpy).toHaveBeenCalled();
    expect(adminVenuesUtils.createVenue).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
});
