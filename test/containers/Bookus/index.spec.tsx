import { render, screen, fireEvent } from '@testing-library/react';
import { BookUs } from 'src/containers/BookUs';

describe('Bookus', () => {
  it('renders correctly', () => {
    const { container } = render(<BookUs />);
    expect(container).toMatchSnapshot();
  });
  it('renders and handles click', () => {
    vi.spyOn(window, 'open').mockImplementation(() => ({} as any));
    render(<BookUs />);
    fireEvent.click(screen.getByRole('button', { name: /current songlist/i }));
    expect(window.open).toHaveBeenCalled();
  });
});
