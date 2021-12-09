import React from 'react';
import renderer from 'react-test-renderer';
import { Gigs } from '../../src/containers/Gigs';

describe('Gigs', ()=>{
  it('is true', ()=>{
    expect(true).toBe(true);
  });
  it('renders correctly', ()=>{
    const gigs = renderer.create(<Gigs/>);
    expect(gigs.toJSON).toMatchSnapshot();
  });
});
