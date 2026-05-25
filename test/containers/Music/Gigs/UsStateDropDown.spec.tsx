import { vi } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
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
    const { container } = render(<UsStateDropDown {...props} />);
    const select = container.querySelector('#edit-us-state')!;
    expect(select).toBeInTheDocument();
  });
});
