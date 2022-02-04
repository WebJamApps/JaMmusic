/* eslint-disable @typescript-eslint/no-explicit-any */
import renderer from 'react-test-renderer';
import { Gigs, makeVenue, columns } from 'src/components/Gigs';

describe('Gigs', ()=>{
  it('renders correctly', ()=>{
    const gigs = renderer.create(<Gigs/>);
    expect(gigs.toJSON).toMatchSnapshot();
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
});
