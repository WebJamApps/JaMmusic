import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DataProvider, IGig, ISong, setGigsDef, setSongsDef } from 'src/providers/Data.provider';
import fetchSongs from 'src/providers/fetchSongs';
import fetchGigs from 'src/providers/fetchGigs';

describe('DataProvider', ()=>{
  it('renders', ()=>{
    fetchSongs.getSongs = jest.fn();
    fetchGigs.getGigs = jest.fn();
    render(<DataProvider><div id="test-div">Test Div Here</div></DataProvider>);
    expect(screen.getByText('Test Div Here')).toBeInTheDocument();
  });
  it('setGigsDef', ()=>{
    expect(setGigsDef([] as IGig[])).toBeUndefined();
  });
  it('setSongsDef', ()=>{
    expect(setSongsDef([] as ISong[])).toBeUndefined();
  });
});
