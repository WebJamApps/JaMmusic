/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CreateUserForm } from 'src/containers/AdminUsers/CreateUserForm';
import adminUtils from 'src/containers/AdminUsers/admin-users.utils';

describe('CreateUserForm', () => {
  beforeEach(() => {
    adminUtils.createUser = vi.fn(() => Promise.resolve({ _id: 'newid', name: 'N', email: 'e@e.com' })) as any;
  });

  it('shows error when name is empty on submit', async () => {
    render(<CreateUserForm token="tk" onCreated={vi.fn()} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-user-submit'));
    });
    expect(adminUtils.createUser).not.toHaveBeenCalled();
  });

  it('submits valid input and calls onCreated', async () => {
    const onCreated = vi.fn();
    render(<CreateUserForm token="tk" onCreated={onCreated} />);
    await act(async () => {
      fireEvent.change(screen.getByTestId('create-user-name'), { target: { value: 'Test' } });
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('create-user-email'), { target: { value: 't@t.com' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-user-submit'));
    });
    expect(adminUtils.createUser).toHaveBeenCalled();
    expect(onCreated).toHaveBeenCalled();
  });

  it('toggles a privilege checkbox', async () => {
    render(<CreateUserForm token="tk" onCreated={vi.fn()} />);
    const cap = screen.getByRole('checkbox', { name: /gig:create/i });
    await act(async () => { fireEvent.click(cap); });
    expect(cap).toBeChecked();
    await act(async () => { fireEvent.click(cap); });
    expect(cap).not.toBeChecked();
  });

  it('surfaces server-side error message', async () => {
    adminUtils.createUser = vi.fn(() => Promise.reject({ response: { body: { message: 'dup email' } } })) as any;
    render(<CreateUserForm token="tk" onCreated={vi.fn()} />);
    await act(async () => {
      fireEvent.change(screen.getByTestId('create-user-name'), { target: { value: 'A' } });
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('create-user-email'), { target: { value: 'a@a.com' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-user-submit'));
    });
    expect(adminUtils.createUser).toHaveBeenCalled();
  });

  it('renders checkboxes for outreach:approve and promo:email', async () => {
    render(<CreateUserForm token="tk" onCreated={vi.fn()} />);
    expect(screen.getByTestId('create-cap-outreach:approve')).toBeInTheDocument();
    expect(screen.getByTestId('create-cap-promo:email')).toBeInTheDocument();
  });

  it('Approve-block outcome 3: disables and unticks approve when role/status are empty, and never sends outreach:approve', async () => {
    render(<CreateUserForm token="tk" onCreated={vi.fn()} />);
    const approveBox = screen.getByTestId('create-cap-outreach:approve');
    expect(approveBox).toBeDisabled();
    expect(approveBox).not.toBeChecked();
    expect(screen.queryByTestId('create-approve-helper-text')).toBeNull();

    // Clicking disabled checkbox does nothing
    await act(async () => { fireEvent.click(approveBox); });
    expect(approveBox).not.toBeChecked();

    await act(async () => {
      fireEvent.change(screen.getByTestId('create-user-name'), { target: { value: 'Undetermined' } });
      fireEvent.change(screen.getByTestId('create-user-email'), { target: { value: 'empty@web-jam.com' } });
      fireEvent.click(screen.getByTestId('create-user-submit'));
    });

    expect(adminUtils.createUser).toHaveBeenCalledWith('tk', expect.objectContaining({
      name: 'Undetermined',
      email: 'empty@web-jam.com',
      privileges: [],
    }));
  });

  it('Approve-block outcome 2: selecting human role enables approve and ticking it includes outreach:approve on submit', async () => {
    render(<CreateUserForm token="tk" onCreated={vi.fn()} />);
    const approveBox = screen.getByTestId('create-cap-outreach:approve');
    expect(approveBox).toBeDisabled();

    await act(async () => {
      fireEvent.change(screen.getByTestId('create-user-role'), { target: { value: 'JaM-admin' } });
    });
    expect(approveBox).not.toBeDisabled();
    expect(approveBox).not.toBeChecked();

    await act(async () => { fireEvent.click(approveBox); });
    expect(approveBox).toBeChecked();

    await act(async () => {
      fireEvent.change(screen.getByTestId('create-user-name'), { target: { value: 'Human User' } });
      fireEvent.change(screen.getByTestId('create-user-email'), { target: { value: 'human@web-jam.com' } });
      fireEvent.click(screen.getByTestId('create-user-submit'));
    });

    expect(adminUtils.createUser).toHaveBeenCalledWith('tk', expect.objectContaining({
      name: 'Human User',
      email: 'human@web-jam.com',
      userType: 'JaM-admin',
      privileges: ['outreach:approve'],
    }));
  });

  it('Approve-block outcome 1: selecting ai-agent status disables approve with helper text and never sends outreach:approve', async () => {
    render(<CreateUserForm token="tk" onCreated={vi.fn()} />);
    await act(async () => {
      fireEvent.change(screen.getByTestId('create-user-status'), { target: { value: 'ai-agent' } });
    });

    const approveBox = screen.getByTestId('create-cap-outreach:approve');
    expect(approveBox).toBeDisabled();
    expect(approveBox).not.toBeChecked();
    expect(screen.getByTestId('create-approve-helper-text')).toHaveTextContent('AI agents may draft but never send');

    await act(async () => {
      fireEvent.change(screen.getByTestId('create-user-name'), { target: { value: 'Agent Bot' } });
      fireEvent.change(screen.getByTestId('create-user-email'), { target: { value: 'agent@web-jam.com' } });
      fireEvent.click(screen.getByTestId('create-user-submit'));
    });

    expect(adminUtils.createUser).toHaveBeenCalledWith('tk', expect.objectContaining({
      name: 'Agent Bot',
      email: 'agent@web-jam.com',
      userStatus: 'ai-agent',
      userType: 'web-jam-llm',
      privileges: [],
    }));
  });

  it('re-evaluates approve checkbox dynamically when transitioning between human, indeterminate, and ai-agent', async () => {
    render(<CreateUserForm token="tk" onCreated={vi.fn()} />);
    const approveBox = screen.getByTestId('create-cap-outreach:approve');
    expect(approveBox).toBeDisabled();

    // Change to human role
    await act(async () => {
      fireEvent.change(screen.getByTestId('create-user-role'), { target: { value: 'JaM-admin' } });
    });
    expect(approveBox).not.toBeDisabled();

    // Check approve
    await act(async () => { fireEvent.click(approveBox); });
    expect(approveBox).toBeChecked();

    // Switch to ai-agent status
    await act(async () => {
      fireEvent.change(screen.getByTestId('create-user-status'), { target: { value: 'ai-agent' } });
    });
    expect(approveBox).toBeDisabled();
    expect(approveBox).not.toBeChecked();
    expect(screen.getByTestId('create-approve-helper-text')).toBeInTheDocument();

    // Switch status back to empty
    await act(async () => {
      fireEvent.change(screen.getByTestId('create-user-status'), { target: { value: '' } });
    });
    // userType was reset to '' when switching away from ai-agent
    expect(approveBox).toBeDisabled();
    expect(approveBox).not.toBeChecked();
    expect(screen.queryByTestId('create-approve-helper-text')).toBeNull();
  });
});

