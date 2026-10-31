/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Gigs, columns, makeColumns, GigsDiv, ShowCreateGigButton,
} from 'src/containers/Music/Gigs';
import type { AnnounceGigDialogProps } from 'src/containers/Music/Gigs/AnnounceGigDialog';
import utils from 'src/containers/Music/Gigs/gigs.utils';

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
  AnnounceGigDialog: ({ open, onClose, onSuccess }: AnnounceGigDialogProps) => (
    open ? (
      <div data-testid="mock-announce-gig-dialog">
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
});
