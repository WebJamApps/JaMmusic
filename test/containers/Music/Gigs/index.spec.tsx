/* eslint-disable @typescript-eslint/no-explicit-any */
import renderer from 'react-test-renderer';
import {
  Gigs, columns, GigsDiv, ShowCreateGigButton,
} from 'src/containers/Music/Gigs';
import utils from 'src/containers/Music/Gigs/gigs.utils';

describe('Gigs', () => {
  it('renders correctly when not isAdmin', () => {
    const gigs = renderer.create(<Gigs isAdmin={false} />);
    expect(JSON.stringify(gigs.toJSON()).includes('gigsDiv')).toBe(true);
  });
  it('renders GigsDiv when isAdmin and handles onRowClick', () => {
    utils.clickToEdit = jest.fn();
    const props = {
      isAdmin: true,
      setShowDialog: jest.fn(),
      setEditGig: jest.fn(),
      editGig: {} as any,
      gigsInOrder: {} as any,
      pageSize: 14,
      showDialog: false,
      editChanged: false,
      setEditChanged: jest.fn(),
      getGigs: jest.fn(),
      auth: {} as any,
    };
    const gigsDiv = renderer.create(<GigsDiv {...props} />).root;
    gigsDiv.findByProps({ className: 'adminGrid' }).props.onRowClick({ row: {} });
    expect(utils.clickToEdit).toHaveBeenCalled();
  });
  it('renders ShowCreateGigButton and handles click', () => {
    const props = { isAdmin: true, setShowDialog: jest.fn() };
    const sButton = renderer.create(<ShowCreateGigButton {...props} />).root;
    sButton.findByProps({ className: 'showCreateDialog' }).props.onClick();
    expect(props.setShowDialog).toHaveBeenCalledWith(true);
  });
  it('renders the location cell with city, state', () => {
    const location:any = columns[2];
    const params:any = { row: { location: '', city: 'Salem', usState: 'Virginia' } };
    const cell:any = location.renderCell(params);
    expect(cell).toBe('Salem, Virginia');
  });
  it('renders the location cell with location', () => {
    const location:any = columns[2];
    const params:any = { row: { location: 'location', city: 'Salem', usState: 'Virginia' } };
    const cell:any = location.renderCell(params);
    expect(cell).toBe('location');
  });
  it('renders the location cell when undefined', () => {
    const location:any = columns[2];
    const params:any = { row: { } };
    const cell:any = location.renderCell(params);
    expect(cell).toBe('');
  });
  it('makeTickets', () => {
    const tickets:any = columns[4];
    const params:any = { value: '<a></a>' };
    const cell:any = tickets.renderCell(params);
    expect(cell.type).toBe('span');
  });
  it('makeTickets defaults to Free', () => {
    const tickets:any = columns[4];
    const params:any = { value: undefined };
    const cell:any = tickets.renderCell(params);
    expect(cell.type).toBe('span');
  });
  it('makeDateValue', () => {
    const date:any = columns[0];
    const params:any = { row: { datetime: new Date().toISOString() } };
    const cell:any = date.renderCell(params);
    expect(typeof cell).toBe('string');
  });
  it('makeDateValue when null', () => {
    const date:any = columns[0];
    const params:any = { row: { datetime: null } };
    const cell:any = date.renderCell(params);
    expect(typeof cell).toBe('string');
  });
  it('makeTimeValue', () => {
    const time:any = columns[1];
    const params:any = { row: { datetime: new Date().toISOString() } };
    const cell:any = time.renderCell(params);
    expect(typeof cell).toBe('string');
  });
  it('makeTimeValue when null', () => {
    const time:any = columns[1];
    const params:any = { row: { datetime: null } };
    const cell:any = time.renderCell(params);
    expect(typeof cell).toBe('string');
  });
});
