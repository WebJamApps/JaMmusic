/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EditPrivilegesDialog } from 'src/containers/AdminUsers/EditPrivilegesDialog';
import adminUtils, { type IadminUser } from 'src/containers/AdminUsers/admin-users.utils';

const user: IadminUser = {
  _id: 'u1', name: 'Bot', email: 'b@x.com', privileges: ['tour:create'],
};

describe('EditPrivilegesDialog', () => {
  beforeEach(() => {
    adminUtils.updateUser = vi.fn(() => Promise.resolve({} as IadminUser)) as any;
  });

  it('initializes with the user privileges', async () => {
    await act(async () => {
      render(
        <EditPrivilegesDialog open user={user} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />,
      );
    });
    expect(screen.getByRole('checkbox', { name: /tour:create/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /song:create/i })).not.toBeChecked();
  });

  it('saves and calls onSaved', async () => {
    const onSaved = vi.fn();
    await act(async () => {
      render(
        <EditPrivilegesDialog open user={user} token="tk" onClose={vi.fn()} onSaved={onSaved} />,
      );
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-priv-save'));
    });
    expect(adminUtils.updateUser).toHaveBeenCalledWith('tk', 'u1', {
      privileges: ['tour:create'],
      userType: undefined,
    });
    expect(onSaved).toHaveBeenCalled();
  });

  it('calls onClose when Cancel clicked', () => {
    const onClose = vi.fn();
    render(<EditPrivilegesDialog open user={user} token="tk" onClose={onClose} onSaved={vi.fn()} />);
    fireEvent.click(screen.getByTestId('edit-priv-cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('toggles a capability checkbox', async () => {
    render(<EditPrivilegesDialog open user={user} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    const cap = screen.getByRole('checkbox', { name: /song:create/i });
    await act(async () => { fireEvent.click(cap); });
    expect(cap).toBeChecked();
  });

  it('handles null user gracefully on save', async () => {
    render(<EditPrivilegesDialog open user={null} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-priv-save'));
    });
    expect(adminUtils.updateUser).not.toHaveBeenCalled();
  });
});
