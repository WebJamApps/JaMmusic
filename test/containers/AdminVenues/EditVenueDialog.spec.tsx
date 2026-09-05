/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EditVenueDialog } from 'src/containers/AdminVenues/EditVenueDialog';
import adminVenuesUtils, { type Ivenue } from 'src/containers/AdminVenues/admin-venues.utils';

vi.mock('@mui/material', async () => {
  const mockMui = await import('../../../__mocks__/@mui/material');
  return {
    ...mockMui,
    Autocomplete: (props: any) => {
      return (
        <div data-testid="mock-autocomplete">
          {props.renderInput({
            role: 'combobox',
            value: props.inputValue || '',
            onChange: (e: any) => {
              if (props.onInputChange) {
                props.onInputChange(e, e.target.value);
              }
            },
            slotProps: {
              input: {
                role: 'combobox',
              },
            },
          })}
          {props.options && props.options.length > 0 && (
            <div data-testid="mock-autocomplete-options">
              {props.options.map((option: any) => {
                const label = props.getOptionLabel ? props.getOptionLabel(option) : (option.description || option);
                return (
                  <button
                    key={option.place_id || label}
                    onClick={(e) => {
                      if (props.onChange) {
                        props.onChange(e, option);
                      }
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    },
  };
});

const venue: Ivenue = {
  _id: 'v1', name: 'Mac n Bob', address: '123 Campbell Ave', city: 'Salem', usState: 'VA', venueType: 'MidRangeCafeBar',
  bookingStatus: 'booking', outreachEligible: false, inScope: true, payAmount: 150, personalFavorite: true,
};

describe('EditVenueDialog', () => {
  beforeEach(() => {
    adminVenuesUtils.updateVenue = vi.fn(() => Promise.resolve({} as Ivenue)) as any;
    adminVenuesUtils.createVenue = vi.fn(() => Promise.resolve({} as Ivenue)) as any;
  });

  it('saves the venue and calls onSaved', async () => {
    const onSaved = vi.fn();
    await act(async () => { render(<EditVenueDialog open venue={venue} token="tk" onClose={vi.fn()} onSaved={onSaved} />); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.objectContaining({
      name: 'Mac n Bob',
    }));
    expect(onSaved).toHaveBeenCalled();
  });

  it('saves gigInterval and resumeBooking inputs', async () => {
    await act(async () => { render(<EditVenueDialog open venue={venue} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />); });
    await act(async () => { fireEvent.change(screen.getByTestId('edit-venue-giginterval'), { target: { value: '3' } }); });
    await act(async () => { fireEvent.change(screen.getByTestId('edit-venue-resumebooking'), { target: { value: '2026-11-20' } }); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.objectContaining({
      gigInterval: 3, resumeBooking: '2026-11-20',
    }));
  });

  it('saves templateOverride selection', async () => {
    await act(async () => { render(<EditVenueDialog open venue={venue} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />); });
    await act(async () => { fireEvent.change(screen.getByTestId('edit-venue-override'), { target: { value: 'MidRangeCafeBar' } }); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.objectContaining({
      templateOverride: 'MidRangeCafeBar',
    }));
  });

  it('saves audienceAttention, payAmount, and personalFavorite fields', async () => {
    await act(async () => { render(<EditVenueDialog open venue={venue} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />); });
    await act(async () => { fireEvent.change(screen.getByTestId('edit-venue-attention'), { target: { value: 'high' } }); });
    await act(async () => { fireEvent.change(screen.getByTestId('edit-venue-pay'), { target: { value: '175' } }); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-personal-favorite')); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.objectContaining({
      audienceAttention: 'high', payAmount: 175, personalFavorite: false,
    }));
  });

  it('renders familyNearby checkbox as disabled (auto-derived from address) and excludes from save payload', async () => {
    await act(async () => {
      render(<EditVenueDialog open venue={{ ...venue, familyNearby: true }} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    const familyCheckbox = screen.getByTestId('edit-venue-family-nearby');
    expect(familyCheckbox).toBeDisabled();
    expect(familyCheckbox).toBeChecked();

    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.not.objectContaining({
      familyNearby: expect.anything(),
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
      change('edit-venue-pay', '120');
      change('edit-venue-lastverified', '2026-07-16');
      change('edit-venue-notes', 'great room');
    });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-personal-favorite')); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.objectContaining({
      city: 'Roanoke', usState: 'VA', venueType: 'Originals', contactName: 'Pat',
      email: 'pat@v.com', secondaryEmail: 'sec@v.com', phone: '540-555-1212', website: 'https://v.com', payAmount: 120, notes: 'great room',
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

  it('clears payAmount back to undefined when emptied', async () => {
    await act(async () => {
      render(<EditVenueDialog open venue={{ ...venue, payAmount: 150 }} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    await act(async () => { fireEvent.change(screen.getByTestId('edit-venue-pay'), { target: { value: '' } }); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.objectContaining({ payAmount: undefined }));
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
    const onSaved = vi.fn();
    await act(async () => {
      render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={onSaved} />);
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-venue-name'), { target: { value: 'New Cafe' } });
      fireEvent.change(screen.getByTestId('edit-venue-address'), { target: { value: '123 Campbell Ave' } });
      fireEvent.change(screen.getByTestId('edit-venue-state'), { target: { value: 'NC' } });
      fireEvent.change(screen.getByTestId('edit-venue-zip'), { target: { value: '28202' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(adminVenuesUtils.createVenue).toHaveBeenCalledWith('tk', expect.objectContaining({
      name: 'New Cafe',
      address: '123 Campbell Ave',
      usState: 'NC',
      country: 'US',
      zipCode: '28202',
    }));
    expect(onSaved).toHaveBeenCalled();
  });

  it('validates that zip code is required when creating a venue', async () => {
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
    expect(screen.getByTestId('edit-venue-error').innerHTML).toBe('Zip code is required');
    expect(adminVenuesUtils.createVenue).not.toHaveBeenCalled();
  });

  it('validates that zip code must be a 5-digit code', async () => {
    await act(async () => {
      render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-venue-name'), { target: { value: 'New Cafe' } });
      fireEvent.change(screen.getByTestId('edit-venue-address'), { target: { value: '123 Campbell Ave' } });
      fireEvent.change(screen.getByTestId('edit-venue-zip'), { target: { value: '2820' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(screen.getByTestId('edit-venue-error').innerHTML).toBe('Zip code must be a valid 5-digit ZIP code');
    expect(adminVenuesUtils.createVenue).not.toHaveBeenCalled();
  });

  it('accepts a valid ZIP+4 format when creating a venue', async () => {
    const onSaved = vi.fn();
    await act(async () => {
      render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={onSaved} />);
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-venue-name'), { target: { value: 'New Cafe' } });
      fireEvent.change(screen.getByTestId('edit-venue-address'), { target: { value: '123 Campbell Ave' } });
      fireEvent.change(screen.getByTestId('edit-venue-state'), { target: { value: 'VA' } });
      fireEvent.change(screen.getByTestId('edit-venue-zip'), { target: { value: '24011-1234' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(adminVenuesUtils.createVenue).toHaveBeenCalledWith('tk', expect.objectContaining({
      name: 'New Cafe',
      zipCode: '24011-1234',
    }));
    expect(onSaved).toHaveBeenCalled();
  });

  it('validates that state is required for US venues', async () => {
    await act(async () => {
      render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-venue-name'), { target: { value: 'New Cafe' } });
      fireEvent.change(screen.getByTestId('edit-venue-address'), { target: { value: '123 Campbell Ave' } });
      fireEvent.change(screen.getByTestId('edit-venue-zip'), { target: { value: '28202' } });
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
      fireEvent.change(screen.getByTestId('edit-venue-zip'), { target: { value: '12345' } });
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
      zipCode: '12345',
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
      fireEvent.change(screen.getByTestId('edit-venue-zip'), { target: { value: '24011' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(confirmSpy).toHaveBeenCalled();
    expect(adminVenuesUtils.createVenue).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('blocks save and shows an error when creating a venue with empty address', async () => {
    await act(async () => { render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />); });
    await act(async () => { fireEvent.change(screen.getByTestId('edit-venue-name'), { target: { value: 'New Venue' } }); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(screen.getByTestId('edit-venue-error').innerHTML).toBe('Street address is required');
    expect(adminVenuesUtils.createVenue).not.toHaveBeenCalled();
  });

  it('blocks save and shows an error when clearing address on a venue that has one', async () => {
    await act(async () => { render(<EditVenueDialog open venue={venue} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />); });
    await act(async () => { fireEvent.change(screen.getByTestId('edit-venue-address'), { target: { value: '' } }); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(screen.getByTestId('edit-venue-error').innerHTML).toBe("Address can't be removed — enter the corrected address");
    expect(adminVenuesUtils.updateVenue).not.toHaveBeenCalled();
  });

  it('blocks save and shows an error when clearing zip code on a venue that has one', async () => {
    const venueWithZip: Ivenue = { ...venue, zipCode: '24011' };
    await act(async () => { render(<EditVenueDialog open venue={venueWithZip} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />); });
    await act(async () => { fireEvent.change(screen.getByTestId('edit-venue-zip'), { target: { value: '' } }); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(screen.getByTestId('edit-venue-error').innerHTML).toBe("Zip code can't be removed — enter the corrected zip code");
    expect(adminVenuesUtils.updateVenue).not.toHaveBeenCalled();
  });

  it('allows saving an existing venue that has no address with an empty address', async () => {
    const legacyVenue: Ivenue = { ...venue, address: '' };
    const onSaved = vi.fn();
    await act(async () => { render(<EditVenueDialog open venue={legacyVenue} token="tk" onClose={vi.fn()} onSaved={onSaved} />); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.objectContaining({ address: '' }));
    expect(onSaved).toHaveBeenCalled();
  });

  it('allows saving an existing venue that has no zip code with an empty zip code', async () => {
    const onSaved = vi.fn();
    await act(async () => { render(<EditVenueDialog open venue={venue} token="tk" onClose={vi.fn()} onSaved={onSaved} />); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.objectContaining({ name: 'Mac n Bob' }));
    expect(onSaved).toHaveBeenCalled();
  });

  it('allows saving an updated zip code on existing venue', async () => {
    const onSaved = vi.fn();
    await act(async () => { render(<EditVenueDialog open venue={venue} token="tk" onClose={vi.fn()} onSaved={onSaved} />); });
    await act(async () => { fireEvent.change(screen.getByTestId('edit-venue-zip'), { target: { value: '24153' } }); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.objectContaining({ zipCode: '24153' }));
    expect(onSaved).toHaveBeenCalled();
  });

  it('surfaces backend notice and server-returned normalized address on save', async () => {
    const onSaved = vi.fn();
    adminVenuesUtils.createVenue = vi.fn(() => Promise.resolve({
      _id: 'v2',
      name: 'Macados',
      address: '100 N Main St',
      notice: 'email also used by Macados Roanoke',
    } as any)) as any;

    await act(async () => { render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={onSaved} />); });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-venue-name'), { target: { value: 'Macados' } });
      fireEvent.change(screen.getByTestId('edit-venue-address'), { target: { value: '100 North Main Street' } });
      fireEvent.change(screen.getByTestId('edit-venue-state'), { target: { value: 'VA' } });
      fireEvent.change(screen.getByTestId('edit-venue-zip'), { target: { value: '24011' } });
    });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });

    expect(adminVenuesUtils.createVenue).toHaveBeenCalledWith('tk', expect.objectContaining({
      name: 'Macados',
      address: '100 North Main Street',
      zipCode: '24011',
    }));
    expect(screen.getByTestId('edit-venue-notice').innerHTML).toBe('email also used by Macados Roanoke');
    expect(onSaved).toHaveBeenCalled();
  });

  describe('Google Places Autocomplete', () => {
    let mockGetPlacePredictions: any;
    let mockGetDetails: any;

    const getFormInput = (testId: string) => {
      const el = screen.getByTestId(testId);
      return el.tagName === 'INPUT' ? el : (el.querySelector('input') || el);
    };

    beforeEach(() => {
      vi.useRealTimers();

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
            { types: ['postal_code'], long_name: '24011' },
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

      const mockAutocompleteService = vi.fn().mockImplementation(function () {
        return {
          getPlacePredictions: mockGetPlacePredictions,
        };
      });

      const mockPlacesService = vi.fn().mockImplementation(function () {
        return {
          getDetails: mockGetDetails,
        };
      });

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
      vi.useRealTimers();
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

      vi.useRealTimers();
      const option = await screen.findByText(/123 Campbell Ave/);
      expect(option).toBeInTheDocument();
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

      const option = await screen.findByText(/123 Campbell Ave/);
      await act(async () => {
        fireEvent.click(option);
      });

      expect(mockGetDetails).toHaveBeenCalledWith(
        expect.objectContaining({ placeId: 'p1' }),
        expect.any(Function)
      );

      expect(input.value).toBe('123 Campbell Ave');
      expect((getFormInput('edit-venue-city') as HTMLInputElement).value).toBe('Roanoke');
      expect((getFormInput('edit-venue-zip') as HTMLInputElement).value).toBe('24011');
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

      const option = await screen.findByText(/123 Campbell Ave/);
      await act(async () => {
        fireEvent.click(option);
      });

      expect(input.value).toBe('456 Yonge St');
      expect((getFormInput('edit-venue-city') as HTMLInputElement).value).toBe('Toronto');
      expect((getFormInput('edit-venue-region') as HTMLInputElement).value).toBe('ON');
    });
  });
});
