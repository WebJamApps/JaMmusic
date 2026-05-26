/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, act } from '@testing-library/react';
import { AuthContext, defaultAuth, type Iauth } from 'src/providers/Auth.provider';
import { AdminUsers } from 'src/containers/AdminUsers';
import adminUtils from 'src/containers/AdminUsers/admin-users.utils';

const adminAuth: Iauth = {
  isAuthenticated: true,
  error: '',
  token: 'tk',
  user: { userType: 'JaM-admin', email: 'a@b.com' },
};

const wrap = (auth: Iauth) => (
  <AuthContext.Provider value={{ auth, setAuth: () => { /* noop */ } }}>
    <AdminUsers />
  </AuthContext.Provider>
);

describe('AdminUsers page', () => {
  beforeEach(() => {
    adminUtils.listUsers = vi.fn(() => Promise.resolve([])) as any;
    adminUtils.getAllowedAdminRoles = vi.fn(() => ['JaM-admin', 'Developer']) as any;
  });

  it('renders not-authorized when user is not authenticated', () => {
    render(wrap(defaultAuth));
    expect(screen.getByTestId('admin-users-unauthorized')).toBeDefined();
  });

  it('renders not-authorized when userType is not in allowed list', () => {
    const otherAuth: Iauth = { ...adminAuth, user: { userType: 'clc-admin', email: 'x@y.com' } };
    render(wrap(otherAuth));
    expect(screen.getByTestId('admin-users-unauthorized')).toBeDefined();
  });

  it('renders the page when user is JaM-admin', async () => {
    await act(async () => { render(wrap(adminAuth)); });
    expect(screen.getByTestId('admin-users-page')).toBeDefined();
    expect(adminUtils.listUsers).toHaveBeenCalledWith('tk');
  });

  it('renders the page when user is Developer (non-prod)', async () => {
    const devAuth: Iauth = { ...adminAuth, user: { userType: 'Developer', email: 'd@d.com' } };
    await act(async () => { render(wrap(devAuth)); });
    expect(screen.getByTestId('admin-users-page')).toBeDefined();
  });

  it('shows an error message when listUsers rejects', async () => {
    adminUtils.listUsers = vi.fn(() => Promise.reject(new Error('boom'))) as any;
    await act(async () => { render(wrap(adminAuth)); });
    expect(screen.getByTestId('admin-users-error').innerHTML).toBe('boom');
  });
});
