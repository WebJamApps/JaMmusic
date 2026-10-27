/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { customFetch } from 'src/lib/fetch.utils';
import type { AddressSuggestion, PlaceAddress } from 'src/containers/AdminVenues/venue-address-lookup';
import { EditVenueDialog } from 'src/containers/AdminVenues/EditVenueDialog';
import adminVenuesUtils, { type Ivenue } from 'src/containers/AdminVenues/admin-venues.utils';

vi.mock('src/lib/fetch.utils', () => ({ customFetch: vi.fn() }));

interface AutocompleteMockProps {
  inputValue: string; options: AddressSuggestion[];
  onInputChange: (event: unknown, value: string, reason: string) => void;
  onChange: (event: unknown, value: AddressSuggestion) => void;
  renderInput: (props: Record<string, unknown>) => React.ReactNode;
  getOptionLabel: (option: AddressSuggestion) => string;
}

vi.mock('@mui/material', async () => {
  const mockMui = await import('../../../__mocks__/@mui/material');
  return {
    ...mockMui,
    Autocomplete: (props: AutocompleteMockProps) => {
      return (
        <div data-testid="mock-autocomplete">
          {props.renderInput({
            role: 'combobox',
            value: props.inputValue || '',
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              if (props.onInputChange) {
                props.onInputChange(e, e.target.value, 'input');
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
              {props.options.map((option: AddressSuggestion) => {
                const label = props.getOptionLabel ? props.getOptionLabel(option) : option.text;
                return (
                  <button
                    key={option.placeId || label}
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
    vi.spyOn(adminVenuesUtils, 'createVenueWithOutcome').mockResolvedValue({ venue: {} as Ivenue, outcome: 'created', status: 201 });
    vi.spyOn(adminVenuesUtils, 'updateVenue').mockResolvedValue({} as Ivenue);
    vi.spyOn(adminVenuesUtils, 'fetchWarningVenues').mockResolvedValue([]);
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

  it('renders familyNearby checkbox as enabled, allows toggling, and includes in save payload', async () => {
    await act(async () => {
      render(<EditVenueDialog open venue={{ ...venue, familyNearby: true }} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    const familyCheckbox = screen.getByTestId('edit-venue-family-nearby');
    expect(familyCheckbox).not.toBeDisabled();
    expect(familyCheckbox).toBeChecked();

    await act(async () => {
      fireEvent.click(familyCheckbox);
    });
    expect(familyCheckbox).not.toBeChecked();

    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.objectContaining({
      familyNearby: false,
    }));
  });

  it('omits familyNearby from payload when checkbox is not touched, preserving backend derived path', async () => {
    await act(async () => {
      render(<EditVenueDialog open venue={{ ...venue, familyNearby: true }} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-venue-address'), { target: { value: '456 New St' } });
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.not.objectContaining({
      familyNearby: expect.anything(),
    }));
  });

  it('omits familyNearby from create payload when checkbox is not touched', async () => {
    const onSaved = vi.fn();
    await act(async () => {
      render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={onSaved} />);
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-venue-name'), { target: { value: 'Untouched Family Venue' } });
      fireEvent.change(screen.getByTestId('edit-venue-city'), { target: { value: 'Salem' } });
      fireEvent.change(screen.getByTestId('edit-venue-address'), { target: { value: '123 Campbell Ave' } });
      fireEvent.change(screen.getByTestId('edit-venue-state'), { target: { value: 'NC' } });
      fireEvent.change(screen.getByTestId('edit-venue-zip'), { target: { value: '28202' } });
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(adminVenuesUtils.createVenueWithOutcome).toHaveBeenCalledWith('tk', expect.not.objectContaining({
      familyNearby: expect.anything(),
    }));
    expect(onSaved).toHaveBeenCalled();
  });

  it('displays Auto-derived status and hides recompute button when venue has no manual override', async () => {
    await act(async () => {
      render(
        <EditVenueDialog
          open
          venue={{ ...venue, familyNearby: true, familyNearbyOverride: false }}
          token="tk"
          onClose={vi.fn()}
          onSaved={vi.fn()}
        />,
      );
    });
    expect(screen.getByTestId('edit-venue-family-nearby-status')).toHaveTextContent('Auto-derived');
    expect(screen.queryByTestId('edit-venue-family-nearby-recompute')).not.toBeInTheDocument();
  });

  it('displays Manual override and allows recomputing from address, sending familyNearby: null on save', async () => {
    const onSaved = vi.fn();
    await act(async () => {
      render(
        <EditVenueDialog
          open
          venue={{ ...venue, familyNearby: true, familyNearbyOverride: true }}
          token="tk"
          onClose={vi.fn()}
          onSaved={onSaved}
        />,
      );
    });

    expect(screen.getByTestId('edit-venue-family-nearby-status')).toHaveTextContent('Manual override');
    const recomputeBtn = screen.getByTestId('edit-venue-family-nearby-recompute');
    expect(recomputeBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(recomputeBtn);
    });

    expect(screen.getByTestId('edit-venue-family-nearby-status')).toHaveTextContent('Auto-derived on save');
    expect(screen.queryByTestId('edit-venue-family-nearby-recompute')).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });

    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.objectContaining({
      familyNearby: null,
    }));
    expect(onSaved).toHaveBeenCalled();
  });

  it('shows recompute affordance after manual checkbox toggle and sends null if recomputed', async () => {
    await act(async () => {
      render(<EditVenueDialog open venue={{ ...venue, familyNearby: false }} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    expect(screen.getByTestId('edit-venue-family-nearby-status')).toHaveTextContent('Auto-derived');
    expect(screen.queryByTestId('edit-venue-family-nearby-recompute')).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-family-nearby'));
    });
    expect(screen.getByTestId('edit-venue-family-nearby-status')).toHaveTextContent('Manual override');
    expect(screen.getByTestId('edit-venue-family-nearby-recompute')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-family-nearby-recompute'));
    });
    expect(screen.getByTestId('edit-venue-family-nearby-status')).toHaveTextContent('Auto-derived on save');

    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.objectContaining({
      familyNearby: null,
    }));
  });

  it('reverts recomputed state back to manual override if user clicks checkbox again', async () => {
    await act(async () => {
      render(
        <EditVenueDialog
          open
          venue={{ ...venue, familyNearby: true, familyNearbyOverride: true }}
          token="tk"
          onClose={vi.fn()}
          onSaved={vi.fn()}
        />,
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-family-nearby-recompute'));
    });
    expect(screen.getByTestId('edit-venue-family-nearby-status')).toHaveTextContent('Auto-derived on save');

    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-family-nearby'));
    });
    expect(screen.getByTestId('edit-venue-family-nearby-status')).toHaveTextContent('Manual override');
    expect(screen.getByTestId('edit-venue-family-nearby-recompute')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.objectContaining({
      familyNearby: false,
    }));
  });

  it('omits familyNearby on create if user toggles checkbox then clicks recompute from address', async () => {
    const onSaved = vi.fn();
    await act(async () => {
      render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={onSaved} />);
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-venue-name'), { target: { value: 'Recomputed Venue' } });
      fireEvent.change(screen.getByTestId('edit-venue-city'), { target: { value: 'Salem' } });
      fireEvent.change(screen.getByTestId('edit-venue-address'), { target: { value: '123 Campbell Ave' } });
      fireEvent.change(screen.getByTestId('edit-venue-state'), { target: { value: 'NC' } });
      fireEvent.change(screen.getByTestId('edit-venue-zip'), { target: { value: '28202' } });
      fireEvent.click(screen.getByTestId('edit-venue-family-nearby'));
    });
    expect(screen.getByTestId('edit-venue-family-nearby-status')).toHaveTextContent('Manual override');

    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-family-nearby-recompute'));
    });
    expect(screen.getByTestId('edit-venue-family-nearby-status')).toHaveTextContent('Auto-derived on save');

    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(adminVenuesUtils.createVenueWithOutcome).toHaveBeenCalledWith('tk', expect.not.objectContaining({
      familyNearby: expect.anything(),
    }));
    expect(onSaved).toHaveBeenCalled();
  });

  it('omits templateOverride and audienceAttention when empty or unset', async () => {
    await act(async () => {
      render(<EditVenueDialog open venue={venue} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v1', expect.not.objectContaining({
      templateOverride: expect.anything(),
      audienceAttention: expect.anything(),
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
    vi.spyOn(adminVenuesUtils, 'updateVenue').mockRejectedValue(new Error('nope'));
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
      fireEvent.change(screen.getByTestId('edit-venue-city'), { target: { value: 'Salem' } });
      fireEvent.change(screen.getByTestId('edit-venue-address'), { target: { value: '123 Campbell Ave' } });
      fireEvent.change(screen.getByTestId('edit-venue-state'), { target: { value: 'NC' } });
      fireEvent.change(screen.getByTestId('edit-venue-zip'), { target: { value: '28202' } });
      fireEvent.click(screen.getByTestId('edit-venue-family-nearby'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(adminVenuesUtils.createVenueWithOutcome).toHaveBeenCalledWith('tk', expect.objectContaining({
      name: 'New Cafe',
      address: '123 Campbell Ave',
      usState: 'NC',
      country: 'US',
      zipCode: '28202',
      familyNearby: true,
    }));
    expect(adminVenuesUtils.createVenueWithOutcome).toHaveBeenCalledWith('tk', expect.not.objectContaining({
      templateOverride: expect.anything(),
      audienceAttention: expect.anything(),
    }));
    expect(onSaved).toHaveBeenCalled();
  });

  it('validates that zip code is required when creating a venue', async () => {
    await act(async () => {
      render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-venue-name'), { target: { value: 'New Cafe' } });
      fireEvent.change(screen.getByTestId('edit-venue-city'), { target: { value: 'Salem' } });
      fireEvent.change(screen.getByTestId('edit-venue-address'), { target: { value: '123 Campbell Ave' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(screen.getByTestId('edit-venue-error').innerHTML).toBe('Zip code is required');
    expect(adminVenuesUtils.createVenueWithOutcome).not.toHaveBeenCalled();
  });

  it('validates that zip code must be a 5-digit code', async () => {
    await act(async () => {
      render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-venue-name'), { target: { value: 'New Cafe' } });
      fireEvent.change(screen.getByTestId('edit-venue-city'), { target: { value: 'Salem' } });
      fireEvent.change(screen.getByTestId('edit-venue-address'), { target: { value: '123 Campbell Ave' } });
      fireEvent.change(screen.getByTestId('edit-venue-zip'), { target: { value: '2820' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(screen.getByTestId('edit-venue-error').innerHTML).toBe('Zip code must be a valid 5-digit ZIP code');
    expect(adminVenuesUtils.createVenueWithOutcome).not.toHaveBeenCalled();
  });

  it('accepts a valid ZIP+4 format when creating a venue', async () => {
    const onSaved = vi.fn();
    await act(async () => {
      render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={onSaved} />);
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-venue-name'), { target: { value: 'New Cafe' } });
      fireEvent.change(screen.getByTestId('edit-venue-city'), { target: { value: 'Salem' } });
      fireEvent.change(screen.getByTestId('edit-venue-address'), { target: { value: '123 Campbell Ave' } });
      fireEvent.change(screen.getByTestId('edit-venue-state'), { target: { value: 'VA' } });
      fireEvent.change(screen.getByTestId('edit-venue-zip'), { target: { value: '24011-1234' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(adminVenuesUtils.createVenueWithOutcome).toHaveBeenCalledWith('tk', expect.objectContaining({
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
      fireEvent.change(screen.getByTestId('edit-venue-city'), { target: { value: 'Salem' } });
      fireEvent.change(screen.getByTestId('edit-venue-address'), { target: { value: '123 Campbell Ave' } });
      fireEvent.change(screen.getByTestId('edit-venue-zip'), { target: { value: '28202' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(screen.getByTestId('edit-venue-error').innerHTML).toBe('State is required for US venues');
    expect(adminVenuesUtils.createVenueWithOutcome).not.toHaveBeenCalled();
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
    vi.spyOn(adminVenuesUtils, 'createVenueWithOutcome').mockResolvedValue({ venue: {} as Ivenue, outcome: 'created', status: 201 });
    await act(async () => {
      render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-venue-name'), { target: { value: 'Global Club' } });
      fireEvent.change(screen.getByTestId('edit-venue-city'), { target: { value: 'Salem' } });
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
    expect(adminVenuesUtils.createVenueWithOutcome).toHaveBeenCalledWith('tk', expect.objectContaining({
      name: 'Global Club',
      address: '123 Campbell Ave',
      country: 'CA',
      region: 'Ontario',
      usState: '',
      zipCode: '12345',
    }));
  });

  it('warns on duplicate venue name and cancels save if user rejects confirm', async () => {
    vi.spyOn(adminVenuesUtils, 'createVenueWithOutcome').mockResolvedValue({ venue: {} as Ivenue, outcome: 'created', status: 201 });
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const existing: Ivenue[] = [{ _id: 'v1', name: 'Existing Venue' }];
    await act(async () => {
      render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={vi.fn()} existingVenues={existing} />);
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-venue-name'), { target: { value: 'existing venue' } });
      fireEvent.change(screen.getByTestId('edit-venue-state'), { target: { value: 'VA' } });
      fireEvent.change(screen.getByTestId('edit-venue-city'), { target: { value: 'Salem' } });
      fireEvent.change(screen.getByTestId('edit-venue-address'), { target: { value: '123 Campbell Ave' } });
      fireEvent.change(screen.getByTestId('edit-venue-zip'), { target: { value: '24011' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-venue-save'));
    });
    expect(confirmSpy).toHaveBeenCalled();
    expect(adminVenuesUtils.createVenueWithOutcome).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('blocks save and shows an error when creating a venue with empty address', async () => {
    await act(async () => { render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />); });
    await act(async () => { fireEvent.change(screen.getByTestId('edit-venue-name'), { target: { value: 'New Venue' } }); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(screen.getByTestId('edit-venue-error').innerHTML).toBe('Street address is required');
    expect(adminVenuesUtils.createVenueWithOutcome).not.toHaveBeenCalled();
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
    vi.spyOn(adminVenuesUtils, 'createVenueWithOutcome').mockResolvedValue({ venue: {
      _id: 'v2',
      name: 'Macados',
      address: '100 N Main St',
      notice: 'email also used by Macados Roanoke',
    } as unknown as Ivenue, outcome: 'created', status: 201 });

    await act(async () => { render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={onSaved} />); });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-venue-name'), { target: { value: 'Macados' } });
      fireEvent.change(screen.getByTestId('edit-venue-city'), { target: { value: 'Salem' } });
      fireEvent.change(screen.getByTestId('edit-venue-address'), { target: { value: '100 North Main Street' } });
      fireEvent.change(screen.getByTestId('edit-venue-state'), { target: { value: 'VA' } });
      fireEvent.change(screen.getByTestId('edit-venue-zip'), { target: { value: '24011' } });
    });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });

    expect(adminVenuesUtils.createVenueWithOutcome).toHaveBeenCalledWith('tk', expect.objectContaining({
      name: 'Macados',
      address: '100 North Main Street',
      zipCode: '24011',
    }));
    expect(screen.getByTestId('edit-venue-notice').innerHTML).toBe('email also used by Macados Roanoke');
    expect(onSaved).toHaveBeenCalled();
  });

  it('shows an inventory error and retries without clearing entered values', async () => {
    vi.spyOn(adminVenuesUtils, 'fetchWarningVenues')
      .mockRejectedValueOnce(new Error('Inventory unavailable')).mockResolvedValueOnce([]);
    await act(async () => { render(<EditVenueDialog open venue={venue} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />); });
    fireEvent.change(screen.getByTestId('edit-venue-name'), { target: { value: 'Retained name' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Inventory unavailable');
    expect(screen.getByTestId('edit-venue-save')).toBeDisabled();
    await act(async () => { fireEvent.click(screen.getByText('Retry existing-venue check')); });
    expect(screen.getByTestId('edit-venue-name')).toHaveValue('Retained name');
    expect(screen.getByTestId('edit-venue-save')).not.toBeDisabled();
  });

  it('ignores an inventory response after closing the dialog', async () => {
    let resolveInventory: (venues: Ivenue[]) => void = () => {};
    vi.spyOn(adminVenuesUtils, 'fetchWarningVenues').mockReturnValue(new Promise((resolve) => { resolveInventory = resolve; }));
    const { rerender } = render(<EditVenueDialog open venue={venue} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    rerender(<EditVenueDialog open={false} venue={venue} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    await act(async () => { resolveInventory([]); });
    expect(adminVenuesUtils.updateVenue).not.toHaveBeenCalled();
  });

  it('retains all inputs after a create refusal and reports the confirmed retry outcome', async () => {
    const onSaved = vi.fn();
    vi.spyOn(adminVenuesUtils, 'createVenueWithOutcome')
      .mockRejectedValueOnce(new Error('Ambiguous venue matches'))
      .mockResolvedValueOnce({ venue, status: 200, outcome: 'updated' });
    await act(async () => { render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={onSaved} />); });
    const fields = { name: 'New Cafe', address: '1 Main St', city: 'Salem', zip: '24153', state: 'VA', website: 'example.test' };
    for (const [field, value] of Object.entries(fields)) {
      fireEvent.change(screen.getByTestId(`edit-venue-${field}`), { target: { value } });
    }
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(screen.getByTestId('edit-venue-error')).toHaveTextContent('Ambiguous venue matches');
    expect(screen.getByTestId('edit-venue-address')).toHaveValue('1 Main St');
    expect(screen.getByTestId('edit-venue-website')).toHaveValue('example.test');
    expect(onSaved).not.toHaveBeenCalled();
    await act(async () => { fireEvent.click(screen.getByTestId('edit-venue-save')); });
    expect(onSaved).toHaveBeenCalledWith('Existing venue updated');
  });

  describe('backend address lookup', () => {
    const details: PlaceAddress = {
      street: '123 Campbell Ave', city: 'Roanoke', state: 'VA', country: 'US', zipCode: '24011-1234', lat: 37.27, lng: -79.94,
    };
    beforeEach(() => {
      vi.useRealTimers();
      vi.mocked(customFetch).mockImplementation(async (url) => new Response(JSON.stringify(
        String(url).includes('/suggest?') ? [{ placeId: 'p1', text: 'Campbell suggestion' }] : details,
      )));
    });
    const openDialog = async () => {
      await act(async () => { render(<EditVenueDialog open venue={null} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />); });
      fireEvent.change(screen.getByTestId('edit-venue-address'), { target: { value: '123 Campbell' } });
      await screen.findByText('Campbell suggestion');
    };
    it('maps the selected address and exact coordinates into the saved form', async () => {
      await openDialog();
      fireEvent.click(screen.getByText('Campbell suggestion'));
      await waitFor(() => expect(screen.getByTestId('edit-venue-city')).toHaveValue('Roanoke'));
      fireEvent.change(screen.getByTestId('edit-venue-name'), { target: { value: 'New venue' } });
      fireEvent.click(screen.getByTestId('edit-venue-save'));
      await waitFor(() => expect(adminVenuesUtils.createVenueWithOutcome).toHaveBeenCalledWith('tk', expect.objectContaining({
        address: '123 Campbell Ave', city: 'Roanoke', usState: 'VA', zipCode: '24011',
        location: { type: 'Point', coordinates: [-79.94, 37.27] },
      })));
    });
    it('keeps manual fields when a detail response arrives late', async () => {
      let finish: (response: Response) => void = () => { throw new Error('No pending details'); };
      await openDialog();
      vi.mocked(customFetch).mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
      fireEvent.click(screen.getByText('Campbell suggestion'));
      fireEvent.change(screen.getByTestId('edit-venue-city'), { target: { value: 'My city' } });
      await act(async () => { finish(new Response(JSON.stringify(details))); });
      expect(screen.getByTestId('edit-venue-city')).toHaveValue('My city');
      expect(screen.getByTestId('edit-venue-address')).toHaveValue('123 Campbell');
    });
    it('retains typed input on detail failure and still enforces required fields', async () => {
      await openDialog();
      vi.mocked(customFetch).mockResolvedValueOnce(new Response('{}', { status: 502 }));
      fireEvent.click(screen.getByText('Campbell suggestion'));
      await screen.findByText(/Address lookup unavailable/);
      expect(screen.getByTestId('edit-venue-address')).toHaveValue('123 Campbell');
      fireEvent.click(screen.getByTestId('edit-venue-save'));
      await screen.findByTestId('edit-venue-error');
      expect(adminVenuesUtils.createVenueWithOutcome).not.toHaveBeenCalled();
    });
    it('drops a selected coordinate when the address is manually changed', async () => {
      await openDialog();
      fireEvent.click(screen.getByText('Campbell suggestion'));
      await waitFor(() => expect(screen.getByTestId('edit-venue-city')).toHaveValue('Roanoke'));
      fireEvent.change(screen.getByTestId('edit-venue-name'), { target: { value: 'New venue' } });
      fireEvent.change(screen.getByTestId('edit-venue-address'), { target: { value: '999 Manual St' } });
      fireEvent.click(screen.getByTestId('edit-venue-save'));
      await waitFor(() => expect(adminVenuesUtils.createVenueWithOutcome).toHaveBeenCalledWith('tk', expect.objectContaining({
        address: '999 Manual St', location: undefined,
      })));
    });
  });
});
