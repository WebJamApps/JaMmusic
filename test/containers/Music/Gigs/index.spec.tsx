/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Gigs, columns, GigsDiv, ShowCreateGigButton,
} from 'src/containers/Music/Gigs';
import utils from 'src/containers/Music/Gigs/gigs.utils';

vi.mock('@mui/x-data-grid', () => ({
  DataGrid: (props: any) => {
    if (props.getRowHeight) props.getRowHeight();
    if (props.onRowClick) props.onRowClick({ row: { _id: '1' } });
    if (props.onPaginationModelChange) props.onPaginationModelChange({ page: 1, pageSize: 10 });
    return <div data-testid="mock-data-grid" />;
  },
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
});
