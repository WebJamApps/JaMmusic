import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DataProvider } from 'src/providers/Data.provider';
import fetchSongs from 'src/providers/fetchSongs';
import fetchGigs from 'src/providers/fetchGigs';

describe('DataProvider', ()=>{
  it('renders', ()=>{
    fetchSongs.getSongs = jest.fn();
    fetchGigs.getGigs = jest.fn();
    render(<DataProvider><div id="test-div">Test Div Here</div></DataProvider>);
    expect(screen.getByText('Test Div Here')).toBeInTheDocument();
  });
});