/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, act } from '@testing-library/react';
import { UsersTable } from 'src/containers/AdminUsers/UsersTable';
import adminUtils, { type IadminUser } from 'src/containers/AdminUsers/admin-users.utils';

describe('UsersTable', () => {
  const users: IadminUser[] = [
    {
      _id: 'u1', name: 'Bot One', email: 'b1@x.com', userStatus: 'ai-agent', privileges: ['gig:create'],
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

  it('renders a Notes column from userDetails', () => {
    const withNotes: IadminUser[] = [{
      _id: 'u9', name: 'N', email: 'n@x.com', userDetails: 'the bot account', privileges: [],
    }];
    render(<UsersTable users={withNotes} token="tk" onShowToken={vi.fn()} onEditPrivileges={vi.fn()} onChange={vi.fn()} />);
    expect(screen.getByText('the bot account')).toBeDefined();
  });

  it('sorts rows when a column header is clicked', () => {
    const two: IadminUser[] = [
      { _id: 'a', name: 'Alice', email: 'a@x.com', privileges: [] },
      { _id: 'b', name: 'Bob', email: 'b@x.com', privileges: [] },
    ];
    render(<UsersTable users={two} token="tk" onShowToken={vi.fn()} onEditPrivileges={vi.fn()} onChange={vi.fn()} />);
    // default sort is name asc -> Alice first
    expect(document.querySelectorAll('tbody tr')[0].getAttribute('data-testid')).toBe('user-row-a');
    // clicking the active Name header flips to desc -> Bob first
    fireEvent.click(screen.getByTestId('sort-name'));
    expect(document.querySelectorAll('tbody tr')[0].getAttribute('data-testid')).toBe('user-row-b');
  });

  it('sorts rows by type correctly when userStatus is missing and defaults to human', () => {
    const mixed: IadminUser[] = [
      { _id: 'u1', name: 'Alice', email: 'a@x.com', userStatus: 'ai-agent', privileges: [] },
      { _id: 'u2', name: 'Bob', email: 'b@x.com', privileges: [] },
    ];
    render(<UsersTable users={mixed} token="tk" onShowToken={vi.fn()} onEditPrivileges={vi.fn()} onChange={vi.fn()} />);
    // Click sort-type to sort by type asc: 'ai-agent' < 'human', so Alice ('u1') first
    fireEvent.click(screen.getByTestId('sort-type'));
    expect(document.querySelectorAll('tbody tr')[0].getAttribute('data-testid')).toBe('user-row-u1');

    // Click sort-type again to sort by type desc: 'human' > 'ai-agent', so Bob ('u2') first
    fireEvent.click(screen.getByTestId('sort-type'));
    expect(document.querySelectorAll('tbody tr')[0].getAttribute('data-testid')).toBe('user-row-u2');
  });
});
