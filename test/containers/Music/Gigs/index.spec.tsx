/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Gigs, columns, makeColumns, GigsDiv, ShowCreateGigButton, GigCard,
} from 'src/containers/Music/Gigs';
import * as mui from '@mui/material';
import type { AnnounceGigDialogProps } from 'src/containers/Music/Gigs/AnnounceGigDialog';
import utils from 'src/containers/Music/Gigs/gigs.utils';
import type { Igig } from 'src/providers/Data.provider';
import type { Iauth } from 'src/providers/Auth.provider';

vi.mock('@mui/x-data-grid', () => ({
  DataGrid: (props: any) => {
    if (props.getRowHeight) props.getRowHeight();
    if (props.onRowClick) props.onRowClick({ row: { _id: '1' } });
    if (props.getRowClassName) props.getRowClassName({ row: { _id: '1', datetime: new Date().toISOString() } });
    if (props.onPaginationModelChange) props.onPaginationModelChange({ page: 1, pageSize: 10 });
    return <div data-testid="mock-data-grid" />;
  },
}));

vi.mock('src/containers/Music/Gigs/CreateGigDialog', () => ({
  CreateGigDialog: ({ onSaveMessage }: { onSaveMessage?: (msg: string) => void }) => (
    <button
      type="button"
      data-testid="mock-create-gig-dialog"
      onClick={() => onSaveMessage?.('Gig created.')}
    >
      mock create
    </button>
  ),
}));

vi.mock('src/containers/Music/Gigs/EditGigDialog', () => ({
  EditGigDialog: ({ onSaveMessage }: { onSaveMessage?: (msg: string) => void }) => (
    <button
      type="button"
      data-testid="mock-edit-gig-dialog"
      onClick={() => onSaveMessage?.('Gig updated.')}
    >
      mock edit
    </button>
  ),
}));

vi.mock('src/containers/Music/Gigs/AnnounceGigDialog', () => ({
  AnnounceGigDialog: ({
    open, onClose, onSuccess, gigs,
  }: AnnounceGigDialogProps) => (
    open ? (
      <div data-testid="mock-announce-gig-dialog" data-gigs-count={gigs?.length}>
        <button type="button" onClick={onClose} data-testid="mock-cancel-announce">cancel announce</button>
        <button type="button" onClick={() => onSuccess?.(new Date().toISOString())} data-testid="mock-success-announce">success announce</button>
      </div>
    ) : null
  ),
}));

describe('Gigs', () => {
  it('renders correctly when not isAdmin', () => {
    const { container } = render(<BrowserRouter><Gigs isAdmin={false} /></BrowserRouter>);
    expect(container.querySelector('.gigsDiv')).toBeInTheDocument();
  });
  it('renders GigsDiv when isAdmin and handles onRowClick', () => {
    window.open = vi.fn();
    utils.clickToEdit = vi.fn();
    const props = {
      isAdmin: true,
      setShowDialog: vi.fn(),
      setEditGig: vi.fn(),
      editGig: {} as any,
      gigsInOrder: {} as any,
      pageSize: 14,
      showDialog: false,
      editChanged: false,
      setEditChanged: vi.fn(),
      getGigs: vi.fn(),
      auth: {} as any,
      setPageSize: vi.fn(),
    };
    render(<BrowserRouter><GigsDiv {...props} /></BrowserRouter>);

    const bookUsButton = screen.getByText(/Book Us/i);
    fireEvent.click(bookUsButton);
    expect(window.open).not.toHaveBeenCalled();

    process.env.APP_NAME = 'joshandmariamusic.com';
    fireEvent.click(bookUsButton);
    expect(window.open).toHaveBeenCalledWith('https://web-jam.com/music/bookus');
  });
  it('renders error message when gigsInOrder is null', () => {
    const props = {
      isAdmin: false,
      setShowDialog: vi.fn(),
      setEditGig: vi.fn(),
      editGig: {} as any,
      gigsInOrder: null,
      pageSize: 5,
      showDialog: false,
      editChanged: false,
      setEditChanged: vi.fn(),
      getGigs: vi.fn(),
      auth: {} as any,
      setPageSize: vi.fn(),
    };
    const { container } = render(<BrowserRouter><GigsDiv {...props} /></BrowserRouter>);
    expect(container.querySelector('.gigs-error-message')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="mock-data-grid"]')).not.toBeInTheDocument();
  });
  it('renders DataGrid when gigsInOrder is empty array', () => {
    const props = {
      isAdmin: false,
      setShowDialog: vi.fn(),
      setEditGig: vi.fn(),
      editGig: {} as any,
      gigsInOrder: [],
      pageSize: 5,
      showDialog: false,
      editChanged: false,
      setEditChanged: vi.fn(),
      getGigs: vi.fn(),
      auth: {} as any,
      setPageSize: vi.fn(),
    };
    const { container } = render(<BrowserRouter><GigsDiv {...props} /></BrowserRouter>);
    expect(container.querySelector('.gigs-error-message')).not.toBeInTheDocument();
    expect(container.querySelector('[data-testid="mock-data-grid"]')).toBeInTheDocument();
  });
  it('displays saveMessage and clears it when either create or edit dialog opens', () => {
    const props = {
      isAdmin: true,
      setShowDialog: vi.fn(),
      setEditGig: vi.fn(),
      editGig: { _id: '' } as any,
      gigsInOrder: [],
      pageSize: 5,
      showDialog: false,
      editChanged: false,
      setEditChanged: vi.fn(),
      getGigs: vi.fn(),
      auth: {} as any,
      setPageSize: vi.fn(),
    };
    const { rerender } = render(<BrowserRouter><GigsDiv {...props} /></BrowserRouter>);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('mock-create-gig-dialog'));
    expect(screen.getByRole('status')).toHaveTextContent('Gig created.');

    rerender(<BrowserRouter><GigsDiv {...props} showDialog /></BrowserRouter>);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    rerender(<BrowserRouter><GigsDiv {...props} showDialog={false} /></BrowserRouter>);
    fireEvent.click(screen.getByTestId('mock-edit-gig-dialog'));
    expect(screen.getByRole('status')).toHaveTextContent('Gig updated.');

    rerender(<BrowserRouter><GigsDiv {...props} editGig={{ _id: 'gig-123' } as any} /></BrowserRouter>);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
  it('renders ShowCreateGigButton and handles click', () => {
    const props = { isAdmin: true, setShowDialog: vi.fn() };
    render(<ShowCreateGigButton {...props} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(props.setShowDialog).toHaveBeenCalledWith(true);
  });
  it('renders the location cell with city, state when venue has no address', () => {
    const location: any = columns[3];
    const params: any = { row: { location: '', city: 'Salem', usState: 'Virginia' } };
    const cell: any = location.renderCell(params);
    expect(cell).toBe('Salem, Virginia');
  });
  it('renders the location cell as a two-line postal address Google Maps link when linked venue has address', () => {
    const location: any = columns[3];
    const params: any = {
      row: {
        location: '',
        venueId: {
          _id: 'v123',
          name: 'The Spot',
          address: '123 Main St',
          city: 'Roanoke',
          usState: 'VA',
        },
      },
    };
    const cell: any = location.renderCell(params);
    expect(cell.type).toBe('a');
    expect(cell.props.href).toBe('https://www.google.com/maps/search/?api=1&query=123%20Main%20St%2C%20Roanoke%2C%20VA');
    expect(cell.props.target).toBe('_blank');
    expect(cell.props.rel).toBe('noopener noreferrer');
    expect(cell.props['aria-label']).toBe('Open The Spot in Google Maps');

    // Test stopPropagation on click
    const stopPropagation = vi.fn();
    cell.props.onClick({ stopPropagation });
    expect(stopPropagation).toHaveBeenCalled();

    // Verify two-line postal address contents
    const { container } = render(cell);
    expect(container.textContent).toContain('123 Main St');
    expect(container.textContent).toContain('Roanoke, VA');
  });
  it('renders location link with fallback accessible name when venue has no name', () => {
    const location: any = columns[3];
    const params: any = {
      row: {
        venueId: {
          _id: 'v123',
          address: '456 Elm St',
          city: 'Salem',
          usState: 'VA',
        },
      },
    };
    const cell: any = location.renderCell(params);
    expect(cell.props['aria-label']).toBe('Open venue in Google Maps');
  });
  it('renders legacy location free-text unlinked even when linked venue has address', () => {
    const location: any = columns[3];
    const params: any = {
      row: {
        location: 'Outdoor Stage',
        venueId: {
          _id: 'v123',
          name: 'The Spot',
          address: '123 Main St',
          city: 'Roanoke',
          usState: 'VA',
        },
      },
    };
    const cell: any = location.renderCell(params);
    expect(cell).toBe('Outdoor Stage');
  });
  it('renders plain unlinked city/state when venue is linked but has empty address', () => {
    const location: any = columns[3];
    const params: any = {
      row: {
        venueId: {
          _id: 'v123',
          name: 'The Spot',
          address: '   ',
          city: 'Roanoke',
          usState: 'VA',
        },
      },
    };
    const cell: any = location.renderCell(params);
    expect(cell).toBe('Roanoke, VA');
  });
  it('renders the location cell with location', () => {
    const location: any = columns[3];
    const params: any = { row: { location: 'location', city: 'Salem', usState: 'Virginia' } };
    const cell: any = location.renderCell(params);
    expect(cell).toBe('location');
  });
  it('renders the location cell when undefined', () => {
    const location: any = columns[3];
    const params: any = { row: {} };
    const cell: any = location.renderCell(params);
    expect(cell).toBe('');
  });
  it('makeTickets', () => {
    const tickets: any = columns[4];
    const params: any = { value: '<a></a>' };
    const cell: any = tickets.renderCell(params);
    expect(cell.type).toBe('span');
  });
  it('makeTickets defaults to Free', () => {
    const tickets: any = columns[4];
    const params: any = { value: undefined };
    const cell: any = tickets.renderCell(params);
    expect(cell.type).toBe('span');
  });
  it('makeDateValue', () => {
    const date: any = columns[0];
    const params: any = { row: { datetime: new Date().toISOString() } };
    const cell: any = date.renderCell(params);
    expect(typeof cell).toBe('string');
  });
  it('makeDateValue when null', () => {
    const date: any = columns[0];
    const params: any = { row: { datetime: null } };
    const cell: any = date.renderCell(params);
    expect(typeof cell).toBe('string');
  });
  it('makeTimeValue', () => {
    const time: any = columns[1];
    const params: any = { row: { datetime: new Date().toISOString() } };
    const cell: any = time.renderCell(params);
    expect(typeof cell).toBe('string');
  });
  it('makeTimeValue when null', () => {
    const time: any = columns[1];
    const params: any = { row: { datetime: null } };
    const cell: any = time.renderCell(params);
    expect(typeof cell).toBe('string');
  });
  it('renders photoCol column renderCell with and without promoImageUrl', () => {
    const photoCol: any = columns[5];
    const paramsWithPhoto: any = { row: { promoImageUrl: 'http://example.com/image.jpg' } };
    const cellWithPhoto = photoCol.renderCell(paramsWithPhoto);
    expect(cellWithPhoto.type).toBe('img');

    const stopPropagation = vi.fn();
    cellWithPhoto.props.onClick({ stopPropagation });
    expect(stopPropagation).toHaveBeenCalled();

    const paramsWithoutPhoto: any = { row: { promoImageUrl: '' } };
    const cellWithoutPhoto = photoCol.renderCell(paramsWithoutPhoto);
    expect(cellWithoutPhoto).toBe('');
  });
  it('makeColumns includes Announce column only when isAdmin is true', () => {
    const nonAdminCols = makeColumns(false, false);
    expect(nonAdminCols).toHaveLength(6);
    expect(nonAdminCols.some((c) => c.field === 'announce')).toBe(false);

    const adminCols = makeColumns(false, true);
    expect(adminCols).toHaveLength(7);
    const announceCol = adminCols.find((c) => c.field === 'announce');
    expect(announceCol).toBeDefined();
    expect(announceCol?.headerName).toBe('Announce');
  });
  it('announceCol renderCell renders Announce button and announced ✓ badge appropriately', () => {
    const onAnnounce = vi.fn();
    const adminCols = makeColumns(false, true, onAnnounce);
    const announceCol = adminCols.find((c) => c.field === 'announce')!;

    // Case 1: Past gig returns empty string
    const yesterday = new Date(Date.now() - 24 * 3600 * 1000 * 5).toISOString();
    const pastParams: any = { row: { datetime: yesterday } };
    expect(announceCol.renderCell!(pastParams)).toBe('');

    // Case 2: Upcoming gig without announcedAt
    const futureDate = new Date(Date.now() + 24 * 3600 * 1000 * 3).toISOString();
    const upcomingRow = { _id: 'g1', datetime: futureDate };
    const upcomingParams: any = { row: upcomingRow };
    const unannouncedCell: any = announceCol.renderCell!(upcomingParams);
    expect(unannouncedCell).not.toBe('');

    const { container: unannouncedContainer } = render(unannouncedCell);
    expect(unannouncedContainer.textContent).toContain('Announce');
    expect(unannouncedContainer.textContent).not.toContain('announced ✓');

    // Clicking Announce button calls onAnnounce and stops propagation
    const stopPropagation = vi.fn();
    const announceBtn = screen.getByRole('button', { name: /Announce/i });
    fireEvent.click(announceBtn, { stopPropagation });
    expect(onAnnounce).toHaveBeenCalledWith(upcomingRow);

    // Case 3: Upcoming gig with announcedAt
    const announcedRow = { _id: 'g2', datetime: futureDate, announcedAt: new Date().toISOString() };
    const announcedParams: any = { row: announcedRow };
    const announcedCell: any = announceCol.renderCell!(announcedParams);
    const { container: announcedContainer } = render(announcedCell);
    expect(announcedContainer.textContent).toContain('Announce');
    expect(announcedContainer.textContent).toContain('announced ✓');
  });
  it('GigsDiv passes row class name with gig-announce-nudge when upcoming within 10 days', () => {
    const isUpcomingSpy = vi.spyOn(utils, 'isUpcomingGig').mockReturnValue(true);
    const isWithin10Spy = vi.spyOn(utils, 'isWithin10Days').mockReturnValue(true);

    const props = {
      isAdmin: true,
      setShowDialog: vi.fn(),
      setEditGig: vi.fn(),
      editGig: {} as any,
      gigsInOrder: [{ _id: 'g1', datetime: new Date().toISOString() }] as any,
      pageSize: 5,
      showDialog: false,
      editChanged: false,
      setEditChanged: vi.fn(),
      getGigs: vi.fn(),
      auth: {} as any,
      setPageSize: vi.fn(),
    };
    render(<BrowserRouter><GigsDiv {...props} /></BrowserRouter>);

    expect(isUpcomingSpy).toHaveBeenCalled();
    expect(isWithin10Spy).toHaveBeenCalled();
  });
  it('places Announce as the first column for an administrator', () => {
    const adminCols = makeColumns(false, true);
    expect(adminCols[0].field).toBe('announce');
    expect(adminCols[0].headerName).toBe('Announce');

    const visitorCols = makeColumns(false, false);
    expect(visitorCols[0].field).toBe('date');
    expect(visitorCols.some((col) => col.field === 'announce')).toBe(false);
  });
  it('ensures column minimum widths fit available content width at 960px and 1024px', () => {
    // At 960px viewport: 960 - 180 (sidebar) - 32 (padding) = 748px available content width
    const adminCols = makeColumns(false, true);
    const totalAdminWidth = adminCols.reduce(
      (sum, col) => sum + (col.minWidth ?? col.width ?? 0),
      0,
    );
    expect(totalAdminWidth).toBeLessThanOrEqual(748);

    // Visitor columns
    const visitorCols = makeColumns(false, false);
    const totalVisitorWidth = visitorCols.reduce(
      (sum, col) => sum + (col.minWidth ?? col.width ?? 0),
      0,
    );
    expect(totalVisitorWidth).toBeLessThanOrEqual(748);
  });
  it('renders one card column under 600 pixels and two from 600 to 959', () => {
    const mediaSpy = vi.spyOn(mui, 'useMediaQuery');
    const mockAuth: Iauth = {
      token: 'mock-token',
      isAuthenticated: true,
      error: '',
      user: { userType: 'admin', email: 'admin@example.com' },
    };
    const mockGig1 = {
      _id: 'g1', venue: 'Slow Play Brewing', datetime: new Date(), tickets: 'Free',
    } as Igig;
    const mockGig2 = {
      _id: 'g2', venue: 'Durty Bull Brewing', datetime: new Date(), tickets: 'Free',
    } as Igig;
    const props = {
      isAdmin: true,
      setShowDialog: vi.fn(),
      setEditGig: vi.fn(),
      editGig: {} as Igig,
      gigsInOrder: [mockGig1, mockGig2],
      pageSize: 5,
      showDialog: false,
      editChanged: false,
      setEditChanged: vi.fn(),
      getGigs: vi.fn(),
      auth: mockAuth,
      setPageSize: vi.fn(),
    };

    // Under 600 pixels: max-width:959px is true, max-width:599px is true
    mediaSpy.mockImplementation((query: unknown) => String(query).includes('959') || String(query).includes('599'));
    const { container, rerender } = render(<BrowserRouter><GigsDiv {...props} /></BrowserRouter>);
    const containerSingle = container.querySelector('.gigs-cards-container');
    expect(containerSingle).toBeInTheDocument();
    expect(containerSingle).toHaveClass('cards-single-col');
    expect(containerSingle).toHaveStyle({ gridTemplateColumns: '1fr' });

    // From 600 to 959 pixels: max-width:959px is true, max-width:599px is false
    mediaSpy.mockImplementation((query: unknown) => String(query).includes('959') && !String(query).includes('599'));
    rerender(<BrowserRouter><GigsDiv {...props} /></BrowserRouter>);
    const containerTwo = container.querySelector('.gigs-cards-container');
    expect(containerTwo).toBeInTheDocument();
    expect(containerTwo).toHaveClass('cards-two-col');
    expect(containerTwo).toHaveStyle({ gridTemplateColumns: 'repeat(2, 1fr)' });

    mediaSpy.mockRestore();
  });
  it('opens Edit Gig on row or card click and does not open Edit Gig on Announce click', () => {
    const clickToEditSpy = vi.spyOn(utils, 'clickToEdit');
    const futureDate = new Date(Date.now() + 86400000);
    const gig = {
      _id: 'g1', venue: 'Slow Play Brewing', datetime: futureDate, tickets: 'Free',
    } as Igig;
    const mockAuth: Iauth = {
      token: 'mock-token',
      isAuthenticated: true,
      error: '',
      user: { userType: 'admin', email: 'admin@example.com' },
    };

    // 1. Desktop table row click
    const props = {
      isAdmin: true,
      setShowDialog: vi.fn(),
      setEditGig: vi.fn(),
      editGig: {} as Igig,
      gigsInOrder: [gig],
      pageSize: 5,
      showDialog: false,
      editChanged: false,
      setEditChanged: vi.fn(),
      getGigs: vi.fn(),
      auth: mockAuth,
      setPageSize: vi.fn(),
    };
    render(<BrowserRouter><GigsDiv {...props} /></BrowserRouter>);
    // DataGrid mock triggers onRowClick during render
    expect(clickToEditSpy).toHaveBeenCalled();
    clickToEditSpy.mockClear();

    // 2. Card view click and Announce click
    const onAnnounce = vi.fn();
    const onEdit = vi.fn();
    const { container: cardContainer } = render(
      <GigCard gig={gig} isAdmin onAnnounce={onAnnounce} onEdit={onEdit} />,
    );

    // Clicking the card opens Edit Gig
    const cardEl = cardContainer.querySelector('.gig-card')!;
    fireEvent.click(cardEl);
    expect(onEdit).toHaveBeenCalledWith(gig);
    onEdit.mockClear();

    // Clicking Announce button opens preview and does NOT open Edit Gig
    const announceBtn = screen.getByRole('button', { name: /Announce/i });
    fireEvent.click(announceBtn);
    expect(onAnnounce).toHaveBeenCalledWith(gig);
    expect(onEdit).not.toHaveBeenCalled();

    clickToEditSpy.mockRestore();
  });
  it('handles keyboard activation on card and prevents bubbling from Announce or links', () => {
    const futureDate = new Date(Date.now() + 86400000);
    const gig = {
      _id: 'g1',
      venue: 'Slow Play Brewing',
      datetime: futureDate,
      tickets: 'Free',
      venueId: {
        _id: 'v1',
        name: 'Slow Play Brewing',
        website: 'https://slowplaybrewing.com',
      },
    } as Igig;

    const onAnnounce = vi.fn();
    const onEdit = vi.fn();
    const { container } = render(
      <GigCard gig={gig} isAdmin onAnnounce={onAnnounce} onEdit={onEdit} />,
    );

    const cardEl = container.querySelector('.gig-card')!;
    expect(cardEl).toHaveAttribute('role', 'button');
    expect(cardEl).toHaveAttribute('tabIndex', '0');

    // 1. Enter on the card itself triggers onEdit
    fireEvent.keyDown(cardEl, { key: 'Enter', target: cardEl });
    expect(onEdit).toHaveBeenCalledWith(gig);
    onEdit.mockClear();

    // 2. Space on the card itself triggers onEdit
    fireEvent.keyDown(cardEl, { key: ' ', target: cardEl });
    expect(onEdit).toHaveBeenCalledWith(gig);
    onEdit.mockClear();

    // 3. Other key (e.g. Tab or Escape) does NOT trigger onEdit
    fireEvent.keyDown(cardEl, { key: 'Escape', target: cardEl });
    expect(onEdit).not.toHaveBeenCalled();

    // 4. Enter on Announce button stops propagation and does NOT trigger onEdit
    const announceBtn = screen.getByRole('button', { name: /Announce/i });
    fireEvent.keyDown(announceBtn, { key: 'Enter' });
    expect(onEdit).not.toHaveBeenCalled();

    // 5. Enter on venue link does NOT trigger onEdit
    const linkEl = container.querySelector('a')!;
    expect(linkEl).toBeInTheDocument();
    fireEvent.keyDown(linkEl, { key: 'Enter' });
    expect(onEdit).not.toHaveBeenCalled();
  });
  it('renders card separator for Our Past Performances', () => {
    const pastGig = {
      venue: 'Our Past Performances', id: 999, datetime: null, tickets: '',
    } as Igig;
    const { container } = render(
      <GigCard gig={pastGig} isAdmin />,
    );
    expect(container.querySelector('.gig-card-separator')).toBeInTheDocument();
    expect(container.textContent).toContain('Our Past Performances');
  });
  it('passes loaded gigsInOrder to AnnounceGigDialog when Announce is triggered', () => {
    const mediaSpy = vi.spyOn(mui, 'useMediaQuery').mockReturnValue(true);
    const futureDate = new Date(Date.now() + 86400000);
    const mockGig1 = {
      _id: 'g1', venue: 'Slow Play Brewing', datetime: futureDate, tickets: 'Free',
    } as Igig;
    const mockGig2 = {
      _id: 'g2', venue: 'Durty Bull Brewing', datetime: futureDate, tickets: 'Free',
    } as Igig;
    const mockAuth: Iauth = {
      token: 'mock-token',
      isAuthenticated: true,
      error: '',
      user: { userType: 'admin', email: 'admin@example.com' },
    };
    const props = {
      isAdmin: true,
      setShowDialog: vi.fn(),
      setEditGig: vi.fn(),
      editGig: {} as Igig,
      gigsInOrder: [mockGig1, mockGig2],
      pageSize: 5,
      showDialog: false,
      editChanged: false,
      setEditChanged: vi.fn(),
      getGigs: vi.fn(),
      auth: mockAuth,
      setPageSize: vi.fn(),
    };
    render(<BrowserRouter><GigsDiv {...props} /></BrowserRouter>);
    expect(screen.queryByTestId('mock-announce-gig-dialog')).not.toBeInTheDocument();

    const announceButtons = screen.getAllByRole('button', { name: /Announce/i });
    fireEvent.click(announceButtons[0]);

    const dialog = screen.getByTestId('mock-announce-gig-dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('data-gigs-count', '2');

    mediaSpy.mockRestore();
  });
});
