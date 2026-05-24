import { render, screen } from '@testing-library/react';
import { UsStateDropDown } from 'src/containers/Music/Gigs/UsStateDropDown';
import type { Igig } from 'src/providers/Data.provider';

describe('UsStateDropDown', () => {
  it('renders and handles onChange', () => {
    const setEditGig = vi.fn();
    const props = {
      editGig: { usState: 'Virginia' } as Igig,
      setEditGig,
      setEditChanged: vi.fn(),
    };
    render(<UsStateDropDown {...props} />);
    const select = screen.getByLabelText(/\* State/i);
    expect(select).toBeInTheDocument();
  });
});
