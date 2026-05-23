/* eslint-disable @typescript-eslint/no-explicit-any */
import renderer, { act } from 'react-test-renderer';
import { UsersTable } from 'src/containers/AdminUsers/UsersTable';
import adminUtils, { type IadminUser } from 'src/containers/AdminUsers/admin-users.utils';

describe('UsersTable', () => {
  const users: IadminUser[] = [
    {
      _id: 'u1', name: 'Bot One', email: 'b1@x.com', userStatus: 'ai-agent', privileges: ['tour:create'],
    },
  ];

  beforeEach(() => {
    adminUtils.mintToken = vi.fn(() => Promise.resolve('JWT')) as any;
    adminUtils.deleteUser = vi.fn(() => Promise.resolve()) as any;
  });

  it('renders empty state when no users', () => {
    const tree = renderer.create(
      <UsersTable users={[]} token="tk" onShowToken={vi.fn()} onEditPrivileges={vi.fn()} onChange={vi.fn()} />,
    ).root;
    expect(tree.findByProps({ 'data-testid': 'users-empty' })).toBeDefined();
  });

  it('renders a row per user', () => {
    const tree = renderer.create(
      <UsersTable users={users} token="tk" onShowToken={vi.fn()} onEditPrivileges={vi.fn()} onChange={vi.fn()} />,
    ).root;
    expect(tree.findByProps({ 'data-testid': 'user-row-u1' })).toBeDefined();
  });

  it('calls onShowToken after minting succeeds', async () => {
    const onShowToken = vi.fn();
    const tree = renderer.create(
      <UsersTable users={users} token="tk" onShowToken={onShowToken} onEditPrivileges={vi.fn()} onChange={vi.fn()} />,
    ).root;
    await act(async () => {
      tree.findByProps({ 'data-testid': 'show-token-u1' }).props.onClick();
    });
    expect(adminUtils.mintToken).toHaveBeenCalledWith('tk', 'u1');
    expect(onShowToken).toHaveBeenCalledWith('JWT');
  });

  it('calls onEditPrivileges with the user', () => {
    const onEdit = vi.fn();
    const tree = renderer.create(
      <UsersTable users={users} token="tk" onShowToken={vi.fn()} onEditPrivileges={onEdit} onChange={vi.fn()} />,
    ).root;
    tree.findByProps({ 'data-testid': 'edit-priv-u1' }).props.onClick();
    expect(onEdit).toHaveBeenCalledWith(users[0]);
  });

  it('confirms before delete and calls onChange', async () => {
    window.confirm = vi.fn(() => true);
    const onChange = vi.fn();
    const tree = renderer.create(
      <UsersTable users={users} token="tk" onShowToken={vi.fn()} onEditPrivileges={vi.fn()} onChange={onChange} />,
    ).root;
    await act(async () => {
      tree.findByProps({ 'data-testid': 'delete-u1' }).props.onClick();
    });
    expect(adminUtils.deleteUser).toHaveBeenCalledWith('tk', 'u1');
    expect(onChange).toHaveBeenCalled();
  });

  it('skips delete when confirm returns false', async () => {
    window.confirm = vi.fn(() => false);
    const tree = renderer.create(
      <UsersTable users={users} token="tk" onShowToken={vi.fn()} onEditPrivileges={vi.fn()} onChange={vi.fn()} />,
    ).root;
    await act(async () => {
      tree.findByProps({ 'data-testid': 'delete-u1' }).props.onClick();
    });
    expect(adminUtils.deleteUser).not.toHaveBeenCalled();
  });
});
