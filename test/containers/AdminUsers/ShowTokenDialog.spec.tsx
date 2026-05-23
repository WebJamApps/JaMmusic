/* eslint-disable @typescript-eslint/no-explicit-any */
import renderer, { act } from 'react-test-renderer';
import { ShowTokenDialog } from 'src/containers/AdminUsers/ShowTokenDialog';

describe('ShowTokenDialog', () => {
  it('renders the token value', () => {
    const tree = renderer.create(<ShowTokenDialog open token="my-jwt" onClose={vi.fn()} />).root;
    expect(tree.findByProps({ 'data-testid': 'token-value' })).toBeDefined();
  });

  it('calls onClose when Done clicked', () => {
    const onClose = vi.fn();
    const tree = renderer.create(<ShowTokenDialog open token="x" onClose={onClose} />).root;
    tree.findByProps({ 'data-testid': 'close-token' }).props.onClick();
    expect(onClose).toHaveBeenCalled();
  });

  it('writes to clipboard when copy clicked', async () => {
    const write = vi.fn(() => Promise.resolve());
    Object.defineProperty(window.navigator, 'clipboard', { value: { writeText: write }, configurable: true });
    const tree = renderer.create(<ShowTokenDialog open token="copy-me" onClose={vi.fn()} />).root;
    await act(async () => {
      tree.findByProps({ 'data-testid': 'copy-token' }).props.onClick();
    });
    expect(write).toHaveBeenCalledWith('copy-me');
  });

  it('tolerates clipboard write failure silently', async () => {
    const write = vi.fn(() => Promise.reject(new Error('blocked')));
    Object.defineProperty(window.navigator, 'clipboard', { value: { writeText: write }, configurable: true });
    const tree = renderer.create(<ShowTokenDialog open token="x" onClose={vi.fn()} />).root;
    await act(async () => {
      tree.findByProps({ 'data-testid': 'copy-token' }).props.onClick();
    });
    expect(write).toHaveBeenCalled();
  });
});
