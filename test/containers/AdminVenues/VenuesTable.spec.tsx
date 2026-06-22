import { render, screen, fireEvent } from '@testing-library/react';
import { VenuesTable } from 'src/containers/AdminVenues/VenuesTable';
import { type Ivenue } from 'src/containers/AdminVenues/admin-venues.utils';

const venues: Ivenue[] = [
  {
    _id: 'v1', name: 'Mac n Bob', city: 'Salem', usState: 'VA', venueType: 'MidRangeCafeBar',
    bookingStatus: 'booking', outreachEligible: true, inScope: true, interested: true,
  },
];

describe('VenuesTable', () => {
  it('renders the empty state', () => {
    render(<VenuesTable venues={[]} onEdit={vi.fn()} />);
    expect(screen.getByTestId('venues-empty')).toBeDefined();
  });

  it('renders a row per venue with the eligible flag', () => {
    render(<VenuesTable venues={venues} onEdit={vi.fn()} />);
    expect(screen.getByTestId('venue-row-v1')).toBeDefined();
    expect(screen.getByTestId('venue-eligible-v1').innerHTML).toBe('yes');
  });

  it('calls onEdit with the venue when Edit is clicked', () => {
    const onEdit = vi.fn();
    render(<VenuesTable venues={venues} onEdit={onEdit} />);
    fireEvent.click(screen.getByTestId('venue-edit-v1'));
    expect(onEdit).toHaveBeenCalledWith(venues[0]);
  });
});
