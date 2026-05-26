/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ShowTokenDialog } from 'src/containers/AdminUsers/ShowTokenDialog';

describe('ShowTokenDialog', () => {
  it('renders the token value', () => {
    render(<ShowTokenDialog open token="my-jwt" onClose={vi.fn()} />);
    expect(screen.getByTestId('token-value')).toBeDefined();
  });

  it('calls onClose when Done clicked', () => {
    const onClose = vi.fn();
    render(<ShowTokenDialog open token="x" onClose={onClose} />);
    fireEvent.click(screen.getByTestId('close-token'));
    expect(onClose).toHaveBeenCalled();
  });

  it('writes to clipboard when copy clicked', async () => {
    const write = vi.fn(() => Promise.resolve());
    Object.defineProperty(window.navigator, 'clipboard', { value: { writeText: write }, configurable: true });
    render(<ShowTokenDialog open token="copy-me" onClose={vi.fn()} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('copy-token'));
    });
    expect(write).toHaveBeenCalledWith('copy-me');
  });

  it('tolerates clipboard write failure silently', async () => {
    const write = vi.fn(() => Promise.reject(new Error('blocked')));
    Object.defineProperty(window.navigator, 'clipboard', { value: { writeText: write }, configurable: true });
    render(<ShowTokenDialog open token="x" onClose={vi.fn()} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('copy-token'));
    });
    expect(write).toHaveBeenCalled();
  });
});
