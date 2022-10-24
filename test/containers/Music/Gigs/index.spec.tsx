/* eslint-disable @typescript-eslint/no-explicit-any */
import renderer from 'react-test-renderer';
import type { IGig } from 'src/providers/Data.provider';
import {
  Gigs, columns,
} from 'src/containers/Music/Gigs';

describe('Gigs', () => {
  it('renders correctly when not isAdmin', () => {
    const gigs = renderer.create(<Gigs isAdmin={false} />);
    expect(JSON.stringify(gigs.toJSON()).includes('gigsDiv')).toBe(true);
  });
  it('renders when isAdmin and handles clicks', () => {
    const gigs = renderer.create(<Gigs isAdmin />).root;
    const result = gigs.findByProps({ className: 'showCreateDialog' }).props.onClick();
    expect(result).toBe(true);
    expect(gigs.findByProps({ className: 'createNewGigDialog' }).props.onClose()).toBe(false);
    expect(gigs.findByProps({ className: 'cancelCreateButton' }).props.onClick()).toBe(false);
    expect(gigs.findByProps({ className: 'createGigButton' }).props.onClick()).toBe(true);
    const dtPicker = gigs.findByProps({ className: 'createDatetime' });
    expect(dtPicker.props.onChange(null)).toBeNull();
    expect(dtPicker.props.renderInput().props.className).toBe('dateTimeInput');
    const venueEditor = gigs.findByProps({ id: 'create-venue' });
    expect(venueEditor.props.onEditorChange('venue')).toBe('venue');
    // const cityEditor = gigs.findByProps({ id: 'create-city' });
    // expect(cityEditor.props.onChange({ target: { value: 'city' } })).toBe('city');
    const stateEditor = gigs.findByProps({ id: 'create-us-state' });
    expect(stateEditor.props.onChange({ target: { value: 'Georgia' } })).toBe('Georgia');
    const ticketsEditor = gigs.findByProps({ id: 'create-tickets' });
    expect(ticketsEditor.props.onChange({ target: { value: 'tickets' } })).toBe('tickets');
  });
  // it('makeVenue', () => {
  //   const columnDef:any = makeVenue();
  //   const params:any = { value: '<div></div>' };
  //   const cell:any = columnDef.renderCell(params);
  //   expect(cell.type).toBe('span');
  // });
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
  // it('makeVenueValue when Our Past Performances', () => {
  //   const result = makeVenueValue('Our Past Performances');
  //   expect(result.type).toBe('span');
  // });
  // it('properly sets the order for gigs', () => {
  //   const setGigsInOrder = jest.fn();
  //   const today = new Date().toISOString();
  //   let tomorrow:any, future:any, yesterday:any;
  //   yesterday = new Date(today);
  //   yesterday.setDate(yesterday.getDate() - 1);
  //   yesterday = new Date(yesterday).toISOString();
  //   tomorrow = new Date(today);
  //   tomorrow.setDate(tomorrow.getDate() + 1);
  //   tomorrow = new Date(tomorrow).toISOString();
  //   future = new Date(tomorrow);
  //   future.setDate(future.getDate() + 2);
  //   future = new Date(future).toISOString();
  //   const gigs = [{ datetime: tomorrow }, { datetime: yesterday }, { datetime: future }, { datetime: today }, { datetime: tomorrow }] as IGig[];
  //   orderGigs(gigs, setGigsInOrder, jest.fn());
  //   expect(setGigsInOrder).toHaveBeenCalled();
  // });
  // it('properly sets the order for gigs when we have many future gigs', () => {
  //   const setGigsInOrder = jest.fn();
  //   const setPageSize = jest.fn();
  //   const today = new Date().toISOString();
  //   let tomorrow:any, future:any, yesterday:any;
  //   yesterday = new Date(today);
  //   yesterday.setDate(yesterday.getDate() - 1);
  //   yesterday = new Date(yesterday).toISOString();
  //   tomorrow = new Date(today);
  //   tomorrow.setDate(tomorrow.getDate() + 1);
  //   tomorrow = new Date(tomorrow).toISOString();
  //   future = new Date(tomorrow);
  //   future.setDate(future.getDate() + 2);
  //   future = new Date(future).toISOString();
  //   const gigs = [
  //     { datetime: future }, { datetime: future },
  //     { datetime: future }, { datetime: future }, { datetime: future },
  //     { datetime: future }, { datetime: future }, { datetime: tomorrow },
  //     { datetime: yesterday }, { datetime: future }, { datetime: today }, { datetime: tomorrow },
  //   ] as IGig[];
  //   orderGigs(gigs, setGigsInOrder, setPageSize);
  //   expect(setPageSize).toHaveBeenCalledWith(12);
  // });
});
