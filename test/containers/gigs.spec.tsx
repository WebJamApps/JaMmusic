/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import renderer from 'react-test-renderer';
import { Gigs, makeVenue } from '../../src/containers/Gigs';

describe('Gigs', ()=>{
  it('is true', ()=>{
    expect(true).toBe(true);
  });
  it('renders correctly', ()=>{
    const gigs = renderer.create(<Gigs/>);
    expect(gigs.toJSON).toMatchSnapshot();
  });
  it('makeVenue', ()=>{
    const columnDef:any = makeVenue();
    const params:any = { value:'<div></div>' };
    const cell:any = columnDef.renderCell(params);
    expect(cell.type).toBe('div');
  });
});
