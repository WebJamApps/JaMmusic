/* eslint-disable @typescript-eslint/no-explicit-any */
import renderer from 'react-test-renderer';
import type { IGig } from 'src/providers/Data.provider';
import { Gigs, makeVenue, columns, makeVenueValue, orderGigs } from 'src/components/Gigs';

describe('Gigs', ()=>{
  it('renders correctly', ()=>{
    const gigs = renderer.create(<Gigs isAdmin={false}/>);
    expect(gigs.toJSON).toMatchSnapshot();
  });
  it('renders when isAdmin and handles clicks', ()=>{
    const gigs = renderer.create(<Gigs isAdmin={true}/>).root;
    const result = gigs.findByProps({ className:'showCreateDialog' }).props.onClick();
    expect(result).toBe(true);
    expect(gigs.findByProps({ className:'createNewGigDialog' }).props.onClose()).toBe(false);
    expect(gigs.findByProps({ className:'cancelButton' }).props.onClick()).toBe(false);
    expect(gigs.findByProps({ variant:'contained' }).props.onClick()).toBe('create');
  });
  it('makeVenue', ()=>{
    const columnDef:any = makeVenue();
    const params:any = { value:'<div></div>' };
    const cell:any = columnDef.renderCell(params);
    expect(cell.type).toBe('span');
  });
  it('makeTickets', ()=>{
    const tickets:any = columns[4];
    const params:any = { value:'<a></a>' };
    const cell:any = tickets.renderCell(params);
    expect(cell.type).toBe('span');
  });
  it('makeTickets defaults to Free', ()=>{
    const tickets:any = columns[4];
    const params:any = { value: undefined };
    const cell:any = tickets.renderCell(params);
    expect(cell.type).toBe('span');
  });
  it('makeVenueValue when Our Past Performances', ()=>{
    const result = makeVenueValue('Our Past Performances');
    expect(result.type).toBe('span');
  });
  it('properly sets the order for gigs', ()=>{
    const setGigsInOrder = jest.fn();
    const today = new Date().toISOString();
    let tomorrow:any, future:any, yesterday:any;
    yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday = new Date(yesterday).toISOString();
    tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow = new Date(tomorrow).toISOString();
    future = new Date(tomorrow);
    future.setDate(future.getDate() + 2);
    future = new Date(future).toISOString();
    const gigs = [{ datetime:tomorrow }, { datetime:yesterday }, { datetime:future }, { datetime:today }, { datetime:tomorrow }] as IGig[];
    orderGigs(gigs, setGigsInOrder);
    expect(setGigsInOrder).toHaveBeenCalled();
  });
});
