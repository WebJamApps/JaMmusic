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
    const cap = screen.getByTestId('cap-tour:create');
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
});
