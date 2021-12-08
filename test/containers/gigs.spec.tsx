import React from 'react';
import renderer from 'react-test-renderer';
import { Gigs } from '../../src/containers/Gigs';

describe('Gigs', ()=>{
  it('renders correctly', ()=>{
    const gigs = renderer.create(<Gigs/>);
    expect(gigs.toJSON).toMatchSnapshot();
  });
});
