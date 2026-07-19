/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EditVenueDialog } from 'src/containers/AdminVenues/EditVenueDialog';
import adminVenuesUtils, { type Ivenue } from 'src/containers/AdminVenues/admin-venues.utils';

const venue: Ivenue = {
  _id: 'v1', name: 'Mac n Bob', address: '123 Campbell Ave', city: 'Salem', usState: 'VA', venueType: 'MidRangeCafeBar',
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
      change('edit-venue-secondary-email', 'sec@v.com');
      change('edit-venue-phone', '540-555-1212');
      change('edit-venue-website', 'https://v.com');
      change('edit-venue-pay', '$$$');
      change('edit-venue-lastverified', '2026-07-16');
      change('edit-venue-notes', 'great room');
    });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-interested')); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.objectContaining({
      city: 'Roanoke', usState: 'VA', venueType: 'Originals', contactName: 'Pat',
      email: 'pat@v.com', secondaryEmail: 'sec@v.com', phone: '540-555-1212', website: 'https://v.com', payTier: '$$$', notes: 'great room',
      lastVerified: '2026-07-16',
    }));
  });

  it('rejects invalid primary email address', async () => {
    await act(async () => {
      render(<EditVenueDialog open venue={venue} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-venue-email'), { target: { value: 'not-an-email' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(screen.getByTestId('edit-venue-error').innerHTML).toBe('Primary Email is invalid');
  });

  it('rejects invalid secondary email address', async () => {
    await act(async () => {
      render(<EditVenueDialog open venue={venue} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-venue-secondary-email'), { target: { value: 'not-an-email' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(screen.getByTestId('edit-venue-error').innerHTML).toBe('Secondary Email is invalid');
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

  it('does not call onClose on backdrop click', async () => {
    const onClose = vi.fn();
    const { container } = render(<EditVenueDialog open venue={venue} token="tk" onClose={onClose} onSaved={vi.fn()} />);
    const backdrop = container.querySelector('.MuiBackdrop-root');
    if (backdrop) {
      await act(async () => { fireEvent.click(backdrop); });
      expect(onClose).not.toHaveBeenCalled();
    }
  });

  it('creates a new venue when venue is null', async () => {
    adminVenuesUtils.createVenue = vi.fn(() => Promise.resolve({} as Ivenue)) as any;
    const onSaved = vi.fn();
    await act(async () => {
      render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={onSaved} />);
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-venue-name'), { target: { value: 'New Cafe' } });
      fireEvent.change(screen.getByTestId('edit-venue-address'), { target: { value: '123 Campbell Ave' } });
      fireEvent.change(screen.getByTestId('edit-venue-state'), { target: { value: 'NC' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(adminVenuesUtils.createVenue).toHaveBeenCalledWith('tk', expect.objectContaining({
      name: 'New Cafe',
      address: '123 Campbell Ave',
      usState: 'NC',
      country: 'US',
    }));
    expect(onSaved).toHaveBeenCalled();
  });

  it('validates that state is required for US venues', async () => {
    adminVenuesUtils.createVenue = vi.fn() as any;
    await act(async () => {
      render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-venue-name'), { target: { value: 'New Cafe' } });
      fireEvent.change(screen.getByTestId('edit-venue-address'), { target: { value: '123 Campbell Ave' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(screen.getByTestId('edit-venue-error').innerHTML).toBe('State is required for US venues');
    expect(adminVenuesUtils.createVenue).not.toHaveBeenCalled();
  });

  it('validates and auto-prefixes website URL', async () => {
    await act(async () => {
      render(<EditVenueDialog open venue={venue} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-venue-website'), { target: { value: 'google.com' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.objectContaining({
      website: 'https://google.com',
    }));
  });

  it('rejects invalid website URLs', async () => {
    await act(async () => {
      render(<EditVenueDialog open venue={venue} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-venue-website'), { target: { value: 'not-a-url' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(screen.getByTestId('edit-venue-error').innerHTML).toBe('A valid website URL is required');
  });

  it('supports non-US countries with free-text region field', async () => {
    adminVenuesUtils.createVenue = vi.fn(() => Promise.resolve({} as Ivenue)) as any;
    await act(async () => {
      render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-venue-name'), { target: { value: 'Global Club' } });
      fireEvent.change(screen.getByTestId('edit-venue-address'), { target: { value: '123 Campbell Ave' } });
      fireEvent.change(screen.getByTestId('edit-venue-country'), { target: { value: 'CA' } });
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-venue-region'), { target: { value: 'Ontario' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(adminVenuesUtils.createVenue).toHaveBeenCalledWith('tk', expect.objectContaining({
      name: 'Global Club',
      address: '123 Campbell Ave',
      country: 'CA',
      region: 'Ontario',
      usState: '',
    }));
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
      fireEvent.change(screen.getByTestId('edit-venue-address'), { target: { value: '123 Campbell Ave' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(confirmSpy).toHaveBeenCalled();
    expect(adminVenuesUtils.createVenue).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('blocks save and shows an error when the address is empty', async () => {
    const blankAddress: Ivenue = { ...venue, address: '' };
    await act(async () => { render(<EditVenueDialog open venue={blankAddress} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(screen.getByTestId('edit-venue-error').innerHTML).toBe('Address is required');
    expect(adminVenuesUtils.updateVenue).not.toHaveBeenCalled();
  });

  describe('Google Places Autocomplete', () => {
    let mockGetPlacePredictions: any;
    let mockGetDetails: any;

    const getFormInput = (testId: string) => {
      const el = screen.getByTestId(testId);
      return el.tagName === 'INPUT' ? el : (el.querySelector('input') || el);
    };

    beforeEach(() => {
      mockGetPlacePredictions = vi.fn((options: any, callback: any) => {
        callback([{ description: '123 Campbell Ave, Roanoke, VA', place_id: 'p1' }], 'OK');
      });

      mockGetDetails = vi.fn((options: any, callback: any) => {
        callback({
          address_components: [
            { types: ['street_number'], long_name: '123' },
            { types: ['route'], long_name: 'Campbell Ave' },
            { types: ['locality'], long_name: 'Roanoke' },
            { types: ['administrative_area_level_1'], short_name: 'VA' },
            { types: ['country'], short_name: 'US' },
          ],
          geometry: {
            location: {
              lat: () => 37.27,
              lng: () => -79.94,
            },
          },
          formatted_address: '123 Campbell Ave, Roanoke, VA 24011',
        }, 'OK');
      });

      const mockAutocompleteService = vi.fn().mockImplementation(() => ({
        getPlacePredictions: mockGetPlacePredictions,
      }));

      const mockPlacesService = vi.fn().mockImplementation(() => ({
        getDetails: mockGetDetails,
      }));

      const mockAutocompleteSessionToken = vi.fn();

      (window as any).google = {
        maps: {
          places: {
            AutocompleteService: mockAutocompleteService,
            PlacesService: mockPlacesService,
            AutocompleteSessionToken: mockAutocompleteSessionToken,
            PlacesServiceStatus: { OK: 'OK' },
          },
        },
      };

      process.env.GOOGLE_MAPS_API_KEY = 'test-api-key';
    });

    afterEach(() => {
      delete (window as any).google;
      delete process.env.GOOGLE_MAPS_API_KEY;
    });

    it('loads the Google Maps script and initializes services', async () => {
      await act(async () => {
        render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
      });
      await waitFor(() => {
        const input = getFormInput('edit-venue-address');
        expect(input.getAttribute('role')).toBe('combobox');
      });
      expect(getFormInput('edit-venue-address')).toBeDefined();
    });

    it('fetches predictions when address input changes', async () => {
      await act(async () => {
        render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
      });

      await waitFor(() => {
        const input = getFormInput('edit-venue-address');
        expect(input.getAttribute('role')).toBe('combobox');
      });

      vi.useFakeTimers();
      const input = getFormInput('edit-venue-address');
      await act(async () => {
        fireEvent.change(input, { target: { value: '123 Campbell' } });
      });

      await act(async () => {
        vi.advanceTimersByTime(350);
      });

      expect(mockGetPlacePredictions).toHaveBeenCalledWith(
        expect.objectContaining({ input: '123 Campbell' }),
        expect.any(Function)
      );
      vi.useRealTimers();
    });

    it('populates address, city, state, country on prediction selection', async () => {
      await act(async () => {
        render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
      });

      await waitFor(() => {
        const input = getFormInput('edit-venue-address');
        expect(input.getAttribute('role')).toBe('combobox');
      });

      vi.useFakeTimers();
      const input = getFormInput('edit-venue-address') as HTMLInputElement;
      await act(async () => {
        fireEvent.change(input, { target: { value: '123 Campbell' } });
      });

      await act(async () => {
        vi.advanceTimersByTime(350);
      });
      vi.useRealTimers();

      const option = await screen.findByText('123 Campbell Ave, Roanoke, VA');
      await act(async () => {
        fireEvent.click(option);
      });

      expect(mockGetDetails).toHaveBeenCalledWith(
        expect.objectContaining({ placeId: 'p1' }),
        expect.any(Function)
      );

      expect(input.value).toBe('123 Campbell Ave');
      expect((getFormInput('edit-venue-city') as HTMLInputElement).value).toBe('Roanoke');
    });

    it('populates non-US countries with free-text region on prediction selection', async () => {
      mockGetDetails.mockImplementationOnce((options: any, callback: any) => {
        callback({
          address_components: [
            { types: ['street_number'], long_name: '456' },
            { types: ['route'], long_name: 'Yonge St' },
            { types: ['locality'], long_name: 'Toronto' },
            { types: ['administrative_area_level_1'], short_name: 'ON' },
            { types: ['country'], short_name: 'CA' },
          ],
          geometry: {
            location: {
              lat: () => 43.65,
              lng: () => -79.38,
            },
          },
          formatted_address: '456 Yonge St, Toronto, ON, Canada',
        }, 'OK');
      });

      await act(async () => {
        render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
      });

      await waitFor(() => {
        const input = getFormInput('edit-venue-address');
        expect(input.getAttribute('role')).toBe('combobox');
      });

      vi.useFakeTimers();
      const input = getFormInput('edit-venue-address') as HTMLInputElement;
      await act(async () => {
        fireEvent.change(input, { target: { value: '456 Yonge' } });
      });

      await act(async () => {
        vi.advanceTimersByTime(350);
      });
      vi.useRealTimers();

      const option = await screen.findByText('123 Campbell Ave, Roanoke, VA');
      await act(async () => {
        fireEvent.click(option);
      });

      expect(input.value).toBe('456 Yonge St');
      expect((getFormInput('edit-venue-city') as HTMLInputElement).value).toBe('Toronto');
      expect((getFormInput('edit-venue-region') as HTMLInputElement).value).toBe('ON');
    });
  });
});
