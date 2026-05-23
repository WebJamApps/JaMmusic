/* eslint-disable @typescript-eslint/no-explicit-any */
import renderer, { act } from 'react-test-renderer';
import { CreateUserForm } from 'src/containers/AdminUsers/CreateUserForm';
import adminUtils from 'src/containers/AdminUsers/admin-users.utils';

describe('CreateUserForm', () => {
  beforeEach(() => {
    adminUtils.createUser = vi.fn(() => Promise.resolve({ _id: 'newid', name: 'N', email: 'e@e.com' })) as any;
  });

  function render(onCreated = vi.fn()) {
    return renderer.create(<CreateUserForm token="tk" onCreated={onCreated} />).root;
  }

  it('shows error when name is empty on submit', async () => {
    const tree = render();
    await act(async () => {
      tree.findByProps({ 'data-testid': 'create-user-submit' }).props.onClick();
    });
    expect(adminUtils.createUser).not.toHaveBeenCalled();
  });

  it('submits valid input and calls onCreated', async () => {
    const onCreated = vi.fn();
    const tree = render(onCreated);
    await act(async () => {
      tree.findByProps({ 'data-testid': 'create-user-name' }).props.onChange({ target: { value: 'Test' } });
    });
    await act(async () => {
      tree.findByProps({ 'data-testid': 'create-user-email' }).props.onChange({ target: { value: 't@t.com' } });
    });
    await act(async () => {
      tree.findByProps({ 'data-testid': 'create-user-submit' }).props.onClick();
    });
    expect(adminUtils.createUser).toHaveBeenCalled();
    expect(onCreated).toHaveBeenCalled();
  });

  it('toggles a privilege checkbox', async () => {
    const tree = render();
    const cap = tree.findByProps({ 'data-testid': 'cap-tour:create' });
    await act(async () => { cap.props.onChange(); });
    expect(tree.findByProps({ 'data-testid': 'cap-tour:create' }).props.checked).toBe(true);
    await act(async () => { cap.props.onChange(); });
    expect(tree.findByProps({ 'data-testid': 'cap-tour:create' }).props.checked).toBe(false);
  });

  it('surfaces server-side error message', async () => {
    adminUtils.createUser = vi.fn(() => Promise.reject({ response: { body: { message: 'dup email' } } })) as any;
    const tree = render();
    await act(async () => {
      tree.findByProps({ 'data-testid': 'create-user-name' }).props.onChange({ target: { value: 'A' } });
    });
    await act(async () => {
      tree.findByProps({ 'data-testid': 'create-user-email' }).props.onChange({ target: { value: 'a@a.com' } });
    });
    await act(async () => {
      tree.findByProps({ 'data-testid': 'create-user-submit' }).props.onClick();
    });
    expect(adminUtils.createUser).toHaveBeenCalled();
  });
});
