/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  render, screen, fireEvent, act, within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { EditUserDialog } from 'src/containers/AdminUsers/EditUserDialog';
import adminUtils, { type IadminUser } from 'src/containers/AdminUsers/admin-users.utils';

const user: IadminUser = {
  _id: 'u1', name: 'Bot', email: 'b@x.com', privileges: ['gig:create'],
};

describe('EditUserDialog', () => {
  beforeEach(() => {
    adminUtils.updateUser = vi.fn(() => Promise.resolve({} as IadminUser)) as any;
  });

  it('initializes with the user privileges', async () => {
    await act(async () => {
      render(
        <EditUserDialog open user={user} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />,
      );
    });
    expect(screen.getByRole('checkbox', { name: /gig:create/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /song:create/i })).not.toBeChecked();
  });

  it('saves and calls onSaved', async () => {
    const onSaved = vi.fn();
    await act(async () => {
      render(
        <EditUserDialog open user={user} token="tk" onClose={vi.fn()} onSaved={onSaved} />,
      );
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-priv-save'));
    });
    expect(adminUtils.updateUser).toHaveBeenCalledWith('tk', 'u1', expect.objectContaining({
      privileges: ['gig:create'],
      name: 'Bot',
      email: 'b@x.com',
    }));
    expect(onSaved).toHaveBeenCalled();
  });

  it('calls onClose when Cancel clicked', () => {
    const onClose = vi.fn();
    render(<EditUserDialog open user={user} token="tk" onClose={onClose} onSaved={vi.fn()} />);
    fireEvent.click(screen.getByTestId('edit-priv-cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('toggles a capability checkbox', async () => {
    render(<EditUserDialog open user={user} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    const cap = screen.getByRole('checkbox', { name: /song:create/i });
    await act(async () => { fireEvent.click(cap); });
    expect(cap).toBeChecked();
  });

  it('handles null user gracefully on save', async () => {
    render(<EditUserDialog open user={null} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-priv-save'));
    });
    expect(adminUtils.updateUser).not.toHaveBeenCalled();
  });

  it('lets a legacy Type be corrected to human and saves userStatus', async () => {
    const legacyUser: IadminUser = {
      _id: 'u2', name: 'Maria', email: 'm@x.com', userStatus: 'enabled', userType: 'JaM-admin', privileges: [],
    };
    await act(async () => {
      render(<EditUserDialog open user={legacyUser} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-user-status'), { target: { value: 'human' } });
    });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-priv-save')); });
    expect(adminUtils.updateUser).toHaveBeenCalledWith('tk', 'u2', expect.objectContaining({ userStatus: 'human' }));
  });

  it('disables the ai-agent Type unless the role is web-jam-llm', async () => {
    const humanUser: IadminUser = {
      _id: 'u3', name: 'Josh', email: 'j@x.com', userStatus: 'human', userType: 'JaM-admin', privileges: [],
    };
    await act(async () => {
      render(<EditUserDialog open user={humanUser} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    const typeSelect = screen.getByTestId('edit-user-status');
    expect(within(typeSelect).getByRole('option', { name: 'ai-agent' })).toBeDisabled();
  });

  it('enables the ai-agent Type for the web-jam-llm role', async () => {
    const botUser: IadminUser = {
      _id: 'u4', name: 'Bot', email: 'bot@x.com', userStatus: 'ai-agent', userType: 'web-jam-llm', privileges: [],
    };
    await act(async () => {
      render(<EditUserDialog open user={botUser} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    const typeSelect = screen.getByTestId('edit-user-status');
    expect(within(typeSelect).getByRole('option', { name: 'ai-agent' })).not.toBeDisabled();
  });

  it('blocks save when the name is cleared', async () => {
    await act(async () => {
      render(<EditUserDialog open user={user} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    await act(async () => { fireEvent.change(screen.getByTestId('edit-user-name'), { target: { value: '' } }); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-priv-save')); });
    expect(adminUtils.updateUser).not.toHaveBeenCalled();
    expect(screen.getByText('Name is required')).toBeDefined();
  });

  it('saves edited name, email and notes', async () => {
    await act(async () => {
      render(<EditUserDialog open user={user} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    await act(async () => { fireEvent.change(screen.getByTestId('edit-user-name'), { target: { value: 'Bot Two' } }); });
    await act(async () => { fireEvent.change(screen.getByTestId('edit-user-email'), { target: { value: 'b2@x.com' } }); });
    await act(async () => { fireEvent.change(screen.getByTestId('edit-user-notes'), { target: { value: 'updated note' } }); });
    await act(async () => { fireEvent.click(screen.getByTestId('edit-priv-save')); });
    expect(adminUtils.updateUser).toHaveBeenCalledWith('tk', 'u1', expect.objectContaining({
      name: 'Bot Two', email: 'b2@x.com', userDetails: 'updated note',
    }));
  });
});
