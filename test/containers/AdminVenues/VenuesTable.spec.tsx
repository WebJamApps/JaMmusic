import { render, screen, fireEvent } from '@testing-library/react';
import { VenuesTable } from 'src/containers/AdminVenues/VenuesTable';
import { type Ivenue } from 'src/containers/AdminVenues/admin-venues.utils';

const venues: Ivenue[] = [
  {
    _id: 'v1', name: 'Mac n Bob', city: 'Salem', usState: 'VA', venueType: 'MidRangeCafeBar',
    bookingStatus: 'booking', outreachEligible: true, inScope: true, interested: true,
  },
];

const rowIds = () => screen.getAllByTestId(/^venue-row-/).map((r) => r.getAttribute('data-testid'));

describe('VenuesTable', () => {
  it('renders the empty state', () => {
    render(<VenuesTable venues={[]} onEdit={vi.fn()} />);
    expect(screen.getByTestId('venues-empty')).toBeDefined();
  });

  it('renders a row per venue with the eligible flag and computed score', () => {
    render(<VenuesTable venues={venues} onEdit={vi.fn()} />);
    expect(screen.getByTestId('venue-row-v1')).toBeDefined();
    expect(screen.getByTestId('venue-eligible-v1').innerHTML).toBe('yes');
    expect(screen.getByTestId('venue-score-v1')).toBeDefined();
  });

  it('calls onEdit with the venue when Edit is clicked', () => {
    const onEdit = vi.fn();
    render(<VenuesTable venues={venues} onEdit={onEdit} />);
    fireEvent.click(screen.getByTestId('venue-edit-v1'));
    expect(onEdit).toHaveBeenCalledWith(venues[0]);
  });

  it('default-sorts eligible venues first, then by prospect score', () => {
    const list: Ivenue[] = [
      { _id: 'low', name: 'Low', outreachEligible: true, originalsFit: 'none' }, // eligible, score 0
      { _id: 'best', name: 'Best', outreachEligible: true, originalsFit: 'loves', interested: true }, // eligible, score 8
      { _id: 'inelig', name: 'Inelig', outreachEligible: false, originalsFit: 'loves', priority: 5 }, // not eligible
    ];
    render(<VenuesTable venues={list} onEdit={vi.fn()} />);
    expect(rowIds()).toEqual(['venue-row-best', 'venue-row-low', 'venue-row-inelig']);
  });

  it('re-sorts by a column when its header is clicked', () => {
    const list: Ivenue[] = [
      { _id: 'b', name: 'Zeta', outreachEligible: true },
      { _id: 'a', name: 'Alpha', outreachEligible: false },
    ];
    render(<VenuesTable venues={list} onEdit={vi.fn()} />);
    fireEvent.click(screen.getByTestId('sort-name'));
    expect(rowIds()).toEqual(['venue-row-a', 'venue-row-b']);
    fireEvent.click(screen.getByTestId('sort-name')); // toggle to desc
    expect(rowIds()).toEqual(['venue-row-b', 'venue-row-a']);
  });

  it('sorts by every column without error', () => {
    const list: Ivenue[] = [
      {
        _id: 'a', name: 'Alpha', city: 'Roanoke', usState: 'VA', venueType: 'Originals',
        bookingStatus: 'booking', outreachEligible: true, inScope: true, interested: true,
        originalsFit: 'loves', payTier: '$$', travelBand: 'local', priority: 2,
      },
      {
        _id: 'b', name: 'Beta', city: 'Salem', usState: 'NC', venueType: 'MidRangeCafeBar',
        bookingStatus: 'booked', outreachEligible: false, inScope: false, interested: false,
        originalsFit: 'none', payTier: '$', travelBand: 'far', priority: 0,
      },
    ];
    render(<VenuesTable venues={list} onEdit={vi.fn()} />);
    ['city', 'state', 'type', 'inScope', 'booking', 'interested', 'eligible',
      'originals', 'pay', 'travel', 'priority', 'prospect'].forEach((key) => {
      fireEvent.click(screen.getByTestId(`sort-${key}`));
      expect(screen.getAllByTestId(/^venue-row-/)).toHaveLength(2);
    });
  });

  it('flags venues with no type', () => {
    const list: Ivenue[] = [{ _id: 'nt', name: 'Junk', outreachEligible: false }];
    render(<VenuesTable venues={list} onEdit={vi.fn()} />);
    expect(screen.getByTestId('venue-notype-nt')).toBeDefined();
  });

  it('archives via onDelete after confirmation', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const onDelete = vi.fn();
    render(<VenuesTable venues={venues} onEdit={vi.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getByTestId('venue-delete-v1'));
    expect(onDelete).toHaveBeenCalledWith(venues[0]);
    confirmSpy.mockRestore();
  });

  it('does not archive when confirmation is cancelled', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const onDelete = vi.fn();
    render(<VenuesTable venues={venues} onEdit={vi.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getByTestId('venue-delete-v1'));
    expect(onDelete).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
  it('paginates at 10 rows/page by default', () => {
    const many: Ivenue[] = Array.from({ length: 15 }, (_, i) => ({
      _id: `m${i}`, name: `V${i}`, outreachEligible: true,
    }));
    render(<VenuesTable venues={many} onEdit={vi.fn()} />);
    expect(screen.getByTestId('venues-page-info').innerHTML).toBe('1–10 of 15');
    expect(screen.getAllByTestId(/^venue-row-/)).toHaveLength(10);
    fireEvent.click(screen.getByTestId('venues-next-page'));
    expect(screen.getByTestId('venues-page-info').innerHTML).toBe('11–15 of 15');
    expect(screen.getAllByTestId(/^venue-row-/)).toHaveLength(5);
    fireEvent.click(screen.getByTestId('venues-prev-page'));
    expect(screen.getByTestId('venues-page-info').innerHTML).toBe('1–10 of 15');
  });

  it('filters live on name and city', () => {
    const list: Ivenue[] = [
      { _id: 'va', name: 'Roanoke Lounge', city: 'Roanoke' },
      { _id: 'vb', name: 'Salem Pub', city: 'Salem' },
      { _id: 'vc', name: 'Random', city: 'Roanoke' },
    ];
    render(<VenuesTable venues={list} onEdit={vi.fn()} />);
    const searchBox = screen.getByPlaceholderText('Search name or city...');
    
    // search for "salem"
    fireEvent.change(searchBox, { target: { value: 'salem' } });
    expect(rowIds()).toEqual(['venue-row-vb']);

    // search for "roanoke"
    fireEvent.change(searchBox, { target: { value: 'roanoke' } });
    expect(rowIds()).toEqual(['venue-row-va', 'venue-row-vc']);
  });

  it('filters un-vetted venues and displays progress stats', () => {
    const list: Ivenue[] = [
      { _id: 'v1', name: 'Vetted 1', venueType: 'MidRangeCafeBar', contactVerified: true },
      { _id: 'v2', name: 'Unvetted 1', venueType: undefined, contactVerified: true }, // needs vetting
      { _id: 'v3', name: 'Unvetted 2', venueType: 'MidRangeCafeBar', contactVerified: undefined }, // needs vetting
    ];
    render(<VenuesTable venues={list} onEdit={vi.fn()} />);
    
    // Vetted stats should show: Vetted 1 of 3 (unvetted is v2, v3)
    expect(screen.getByTestId('venues-vetted-counter').innerHTML).toContain('Vetted 1 of 3');

    // Click Needs Vetting toggle
    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);

    // Now only the unvetted rows should be shown
    expect(rowIds()).toEqual(['venue-row-v2', 'venue-row-v3']);
  });

  it('renders inputs container with responsive wrap and non-shrinking inputs', () => {
    render(
      <VenuesTable
        venues={[]}
        onEdit={vi.fn()}
        targetDate="2026-07-02"
        setTargetDate={vi.fn()}
      />
    );
    
    const container = screen.getByTestId('venues-inputs-container');
    expect(container).toBeDefined();

    const searchBox = screen.getByTestId('venues-search-box');
    expect(searchBox).toBeDefined();

    const targetDate = screen.getByTestId('venues-target-date');
    expect(targetDate).toBeDefined();

    const switchBtn = screen.getByTestId('venues-needs-vetting-filter');
    expect(switchBtn).toBeDefined();
  });
});
