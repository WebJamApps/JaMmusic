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

  it('renders checkboxes for outreach:approve and promo:email', async () => {
    await act(async () => {
      render(<EditUserDialog open user={user} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    expect(screen.getByTestId('edit-cap-outreach:approve')).toBeInTheDocument();
    expect(screen.getByTestId('edit-cap-promo:email')).toBeInTheDocument();
  });

  it('Approve-block outcome 1: disables and unticks approve with helper text for AI agents, and never sends outreach:approve', async () => {
    const agentUser: IadminUser = {
      _id: 'u-agent',
      name: 'Agent Bot',
      email: 'agent@web-jam.com',
      userType: 'web-jam-llm',
      userStatus: 'ai-agent',
      privileges: ['gig:create', 'outreach:approve'],
    };
    await act(async () => {
      render(<EditUserDialog open user={agentUser} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });

    const approveBox = screen.getByTestId('edit-cap-outreach:approve');
    expect(approveBox).toBeDisabled();
    expect(approveBox).not.toBeChecked();
    expect(screen.getByText('AI agents may draft but never send')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-priv-save'));
    });
    expect(adminUtils.updateUser).toHaveBeenCalledWith('tk', 'u-agent', expect.objectContaining({
      privileges: ['gig:create'],
    }));
  });

  it('Cleanup path: opening agent account holding outreach:approve and saving drops it while keeping other caps', async () => {
    const agentUserWithApprove: IadminUser = {
      _id: 'u-agent-cleanup',
      name: 'Agent Bot',
      email: 'agent@web-jam.com',
      userType: 'web-jam-llm',
      userStatus: 'ai-agent',
      privileges: ['gig:create', 'venue:create', 'outreach:create', 'outreach:approve'],
    };
    await act(async () => {
      render(<EditUserDialog open user={agentUserWithApprove} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });

    // Save immediately without changing anything
    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-priv-save'));
    });

    expect(adminUtils.updateUser).toHaveBeenCalledWith('tk', 'u-agent-cleanup', expect.objectContaining({
      privileges: ['gig:create', 'venue:create', 'outreach:create'],
    }));
  });

  it('Approve-block outcome 2: enables approve for human account and ticking it sends outreach:approve', async () => {
    const humanUser: IadminUser = {
      _id: 'u-human',
      name: 'Josh',
      email: 'josh@web-jam.com',
      userType: 'JaM-admin',
      userStatus: 'human',
      privileges: ['gig:create'],
    };
    await act(async () => {
      render(<EditUserDialog open user={humanUser} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });

    const approveBox = screen.getByTestId('edit-cap-outreach:approve');
    expect(approveBox).not.toBeDisabled();
    expect(approveBox).not.toBeChecked();
    expect(screen.queryByText('AI agents may draft but never send')).toBeNull();

    await act(async () => {
      fireEvent.click(approveBox);
    });
    expect(approveBox).toBeChecked();

    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-priv-save'));
    });
    expect(adminUtils.updateUser).toHaveBeenCalledWith('tk', 'u-human', expect.objectContaining({
      privileges: expect.arrayContaining(['gig:create', 'outreach:approve']),
    }));
  });

  it('Approve-block outcome 3: disables approve when role and status are both empty, and re-evaluates when role/status changes', async () => {
    const emptyUser: IadminUser = {
      _id: 'u-empty',
      name: 'Undetermined',
      email: 'empty@web-jam.com',
      userType: '',
      userStatus: '',
      privileges: ['gig:create', 'outreach:approve'],
    };
    await act(async () => {
      render(<EditUserDialog open user={emptyUser} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });

    const approveBox = screen.getByTestId('edit-cap-outreach:approve');
    expect(approveBox).toBeDisabled();
    expect(approveBox).not.toBeChecked();
    expect(screen.queryByText('AI agents may draft but never send')).toBeNull();

    // Changing role to JaM-admin enables approve
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-user-role'), { target: { value: 'JaM-admin' } });
    });
    expect(approveBox).not.toBeDisabled();

    // Tick approve
    await act(async () => {
      fireEvent.click(approveBox);
    });
    expect(approveBox).toBeChecked();

    // Changing status to ai-agent immediately unticks and disables approve with helper text
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-user-status'), { target: { value: 'ai-agent' } });
    });
    expect(approveBox).toBeDisabled();
    expect(approveBox).not.toBeChecked();
    expect(screen.getByText('AI agents may draft but never send')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-priv-save'));
    });
    expect(adminUtils.updateUser).toHaveBeenCalledWith('tk', 'u-empty', expect.objectContaining({
      privileges: ['gig:create'],
    }));
  });

  it('clearing Type on an agent account also clears the web-jam-llm role, so the Role select never holds a filtered-out value', async () => {
    const agentUser: IadminUser = {
      _id: 'u-agent-clear',
      name: 'Agent Bot',
      email: 'agent@web-jam.com',
      userType: 'web-jam-llm',
      userStatus: 'ai-agent',
      privileges: ['gig:create'],
    };
    await act(async () => {
      render(<EditUserDialog open user={agentUser} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    expect(screen.getByTestId('edit-user-role')).toHaveValue('web-jam-llm');

    // Clearing Type drops `web-jam-llm` from the Role options, so the role must clear with it.
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-user-status'), { target: { value: '' } });
    });
    expect(screen.getByTestId('edit-user-role')).toHaveValue('');

    // Picking a human role now sends no userStatus AND no stale agent role, so the backend
    // cannot end up storing role `JaM-admin` beside the stored status `ai-agent`.
    await act(async () => {
      fireEvent.change(screen.getByTestId('edit-user-role'), { target: { value: 'JaM-admin' } });
      fireEvent.click(screen.getByTestId('edit-priv-save'));
    });
    expect(adminUtils.updateUser).toHaveBeenCalledWith('tk', 'u-agent-clear', expect.objectContaining({
      userType: 'JaM-admin',
      userStatus: undefined,
    }));
  });

  it('renders the Promotion group without leading empty CRUD columns', async () => {
    await act(async () => {
      render(<EditUserDialog open user={user} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });
    // Promotion has no CRUD member, so its row holds `email` alone — the four empty
    // placeholder columns that used to precede it are gone.
    const promoRow = screen.getByText('Promotion').parentElement as HTMLElement;
    expect(within(promoRow).getAllByRole('checkbox')).toHaveLength(1);
    expect(within(promoRow).getByRole('checkbox')).toBe(screen.getByTestId('edit-cap-promo:email'));
    // Groups that do have CRUD members keep their column alignment.
    const outreachRow = screen.getByText('Outreach').parentElement as HTMLElement;
    expect(within(outreachRow).getAllByRole('checkbox')).toHaveLength(4);
  });

  it('preserves all existing privileges on save that the rule does not remove', async () => {
    const existingCapsUser: IadminUser = {
      _id: 'u-multi',
      name: 'Admin',
      email: 'admin@web-jam.com',
      userType: 'JaM-admin',
      userStatus: 'human',
      privileges: ['gig:create', 'gig:edit', 'venue:create', 'outreach:create', 'tour:create'],
    };
    await act(async () => {
      render(<EditUserDialog open user={existingCapsUser} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('edit-priv-save'));
    });
    expect(adminUtils.updateUser).toHaveBeenCalledWith('tk', 'u-multi', expect.objectContaining({
      privileges: ['gig:create', 'gig:edit', 'venue:create', 'outreach:create', 'tour:create'],
    }));
  });
});
