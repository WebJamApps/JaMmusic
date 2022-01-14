/* eslint-disable @typescript-eslint/no-explicit-any */

import renderer from 'react-test-renderer';
import { Gigs, makeVenue } from 'src/components/Gigs';

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
});
