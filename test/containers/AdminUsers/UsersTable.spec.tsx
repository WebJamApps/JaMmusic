/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, act } from '@testing-library/react';
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
    render(<UsersTable users={[]} token="tk" onShowToken={vi.fn()} onEditPrivileges={vi.fn()} onChange={vi.fn()} />);
    expect(screen.getByTestId('users-empty')).toBeDefined();
  });

  it('renders a row per user', () => {
    render(<UsersTable users={users} token="tk" onShowToken={vi.fn()} onEditPrivileges={vi.fn()} onChange={vi.fn()} />);
    expect(screen.getByTestId('user-row-u1')).toBeDefined();
  });

  it('calls onShowToken after minting succeeds', async () => {
    const onShowToken = vi.fn();
    render(<UsersTable users={users} token="tk" onShowToken={onShowToken} onEditPrivileges={vi.fn()} onChange={vi.fn()} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('show-token-u1'));
    });
    expect(adminUtils.mintToken).toHaveBeenCalledWith('tk', 'u1');
    expect(onShowToken).toHaveBeenCalledWith('JWT');
  });

  it('calls onEditPrivileges with the user', () => {
    const onEdit = vi.fn();
    render(<UsersTable users={users} token="tk" onShowToken={vi.fn()} onEditPrivileges={onEdit} onChange={vi.fn()} />);
    fireEvent.click(screen.getByTestId('edit-priv-u1'));
    expect(onEdit).toHaveBeenCalledWith(users[0]);
  });

  it('confirms before delete and calls onChange', async () => {
    window.confirm = vi.fn(() => true);
    const onChange = vi.fn();
    render(<UsersTable users={users} token="tk" onShowToken={vi.fn()} onEditPrivileges={vi.fn()} onChange={onChange} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('delete-u1'));
    });
    expect(adminUtils.deleteUser).toHaveBeenCalledWith('tk', 'u1');
    expect(onChange).toHaveBeenCalled();
  });

  it('skips delete when confirm returns false', async () => {
    window.confirm = vi.fn(() => false);
    render(<UsersTable users={users} token="tk" onShowToken={vi.fn()} onEditPrivileges={vi.fn()} onChange={vi.fn()} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('delete-u1'));
    });
    expect(adminUtils.deleteUser).not.toHaveBeenCalled();
  });
});
