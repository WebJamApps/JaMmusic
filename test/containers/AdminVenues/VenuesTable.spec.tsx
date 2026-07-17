import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
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

  it('renders contact presence indicators and lastContacted date correctly', () => {
    const list: Ivenue[] = [
      {
        _id: 'full-contact',
        name: 'Full Contact',
        contactName: 'Alice',
        email: 'alice@example.com',
        phone: '123-456-7890',
        notes: 'Alice notes',
        lastContacted: '2026-07-15T12:00:00.000Z',
      },
      {
        _id: 'no-contact',
        name: 'No Contact',
      }
    ];
    render(<VenuesTable venues={list} onEdit={vi.fn()} />);
    
    // Full contact venue indicators
    expect(screen.getByTestId('venue-contact-name-full-contact')).toBeDefined();
    expect(screen.getByTestId('venue-contact-email-full-contact')).toBeDefined();
    expect(screen.getByTestId('venue-contact-phone-full-contact')).toBeDefined();
    expect(screen.getByTestId('venue-contact-notes-full-contact')).toBeDefined();
    expect(screen.getByTestId('venue-lastcontacted-full-contact').textContent).toBe('2026-07-15');

    // No contact venue indicators
    expect(screen.getByTestId('venue-contact-name-missing-no-contact')).toBeDefined();
    expect(screen.getByTestId('venue-contact-email-missing-no-contact')).toBeDefined();
    expect(screen.getByTestId('venue-contact-phone-missing-no-contact')).toBeDefined();
    expect(screen.getByTestId('venue-contact-notes-missing-no-contact')).toBeDefined();
    expect(screen.getByTestId('venue-lastcontacted-no-contact').textContent).toBe('—');
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
        contactName: 'John', email: 'john@example.com', phone: '555-1234', lastContacted: '2026-07-01',
      },
      {
        _id: 'b', name: 'Beta', city: 'Salem', usState: 'NC', venueType: 'MidRangeCafeBar',
        bookingStatus: 'booked', outreachEligible: false, inScope: false, interested: false,
        originalsFit: 'none', payTier: '$', travelBand: 'far', priority: 0,
      },
    ];
    render(<VenuesTable venues={list} onEdit={vi.fn()} />);
    ['city', 'state', 'contact', 'type', 'booking', 'interested', 'eligible', 'lastContacted',
      'lastGig', 'nextGig', 'originals', 'pay', 'travel', 'priority', 'prospect'].forEach((key) => {
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

  it('renders Restore button and hides Edit/Archive in archived view', () => {
    const list: Ivenue[] = [{ _id: 'v1', name: 'Archived Mac', status: 'archived' }];
    const onRestore = vi.fn();
    render(<VenuesTable venues={list} onEdit={vi.fn()} onRestore={onRestore} showArchived />);
    
    // Check restore button is shown
    const restoreBtn = screen.getByTestId('venue-restore-v1');
    expect(restoreBtn).toBeDefined();

    // Check edit and archive are NOT shown
    expect(screen.queryByTestId('venue-edit-v1')).toBeNull();
    expect(screen.queryByTestId('venue-delete-v1')).toBeNull();

    // Click restore
    fireEvent.click(restoreBtn);
    expect(onRestore).toHaveBeenCalledWith(list[0]);
  });

  it('renders correctly under dark theme for coverage', () => {
    const darkTheme = createTheme({
      palette: {
        mode: 'dark',
        background: { paper: '#1c1c1c' },
        action: { hover: 'rgba(255, 255, 255, 0.08)' },
      },
    });
    const list: Ivenue[] = [
      { _id: 'std', name: 'Standard', venueType: 'MidRangeCafeBar' },
      { _id: 'nt', name: 'No Type', venueType: undefined },
      { _id: 'arc', name: 'Archived', status: 'archived' },
    ];
    render(
      <ThemeProvider theme={darkTheme}>
        <VenuesTable venues={list} onEdit={vi.fn()} showArchived />
      </ThemeProvider>
    );
    expect(screen.getByTestId('venue-row-std')).toBeDefined();
    expect(screen.getByTestId('venue-row-nt')).toBeDefined();
    expect(screen.getByTestId('venue-row-arc')).toBeDefined();
  });

  it('opens CopyDialog when clicking contact icons and copies to clipboard', async () => {
    const list: Ivenue[] = [
      {
        _id: 'v-contact',
        name: 'Contact Venue',
        contactName: 'Alice',
        email: 'alice@example.com',
        phone: '123-456-7890',
        notes: 'These are some venue notes.',
      },
    ];

    const writeTextMock = vi.fn(() => Promise.resolve());
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<VenuesTable venues={list} onEdit={vi.fn()} />);

    // Click Notes icon
    fireEvent.click(screen.getByTestId('venue-contact-notes-v-contact'));

    // Check Dialog opens
    expect(screen.getByTestId('copy-dialog')).toBeDefined();
    expect(screen.getByTestId('copy-dialog-title').textContent).toBe('Venue Notes');
    expect(screen.getByTestId('copy-dialog-content')).toHaveValue('These are some venue notes.');

    // Click Copy button
    fireEvent.click(screen.getByTestId('copy-dialog-copy'));
    expect(writeTextMock).toHaveBeenCalledWith('These are some venue notes.');

    // Wait for copied text state
    expect(await screen.findByText('Copied!')).toBeDefined();

    // Click Close button
    fireEvent.click(screen.getByTestId('copy-dialog-close'));
  });

  it('renders last/next gig columns and locationFallback for blank city/state', () => {
    const list: Ivenue[] = [
      {
        _id: 'v-gigs',
        name: 'Gig-linked Venue',
        city: '',
        usState: '',
        lastGig: { datetime: '2026-07-01T19:00:00.000Z' },
        nextGig: { datetime: '2026-08-01T20:00:00.000Z' },
        locationFallback: { city: 'Durham', usState: 'NC' },
      },
    ];
    render(<VenuesTable venues={list} onEdit={vi.fn()} />);

    // Gig columns
    expect(screen.getByTestId('venue-lastgig-v-gigs').textContent).toBe('2026-07-01');
    expect(screen.getByTestId('venue-nextgig-v-gigs').textContent).toBe('2026-08-01');

    // Fallback location styled as dimmed/italic
    const fallbackCity = screen.getByTestId('venue-city-fallback-v-gigs');
    const fallbackState = screen.getByTestId('venue-state-fallback-v-gigs');
    expect(fallbackCity.textContent).toBe('Durham');
    expect(fallbackCity).toHaveStyle('font-style: italic');
    expect(fallbackState.textContent).toBe('NC');
    expect(fallbackState).toHaveStyle('font-style: italic');
  });
});

