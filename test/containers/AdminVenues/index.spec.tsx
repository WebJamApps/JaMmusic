/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, act } from '@testing-library/react';
import { AuthContext, defaultAuth, type Iauth } from 'src/providers/Auth.provider';
import { AdminVenues } from 'src/containers/AdminVenues';
import adminVenuesUtils from 'src/containers/AdminVenues/admin-venues.utils';

const adminAuth: Iauth = {
  isAuthenticated: true,
  error: '',
  token: 'tk',
  user: { userType: 'JaM-admin', email: 'a@b.com' },
};

const wrap = (auth: Iauth) => (
  <AuthContext.Provider value={{ auth, setAuth: () => { /* noop */ } }}>
    <AdminVenues />
  </AuthContext.Provider>
);

describe('AdminVenues page', () => {
  beforeEach(() => {
    adminVenuesUtils.listVenues = vi.fn(() => Promise.resolve([])) as any;
    adminVenuesUtils.getConfig = vi.fn(() => Promise.resolve({ autoApprove: false })) as any;
    adminVenuesUtils.getAllowedAdminRoles = vi.fn(() => ['JaM-admin', 'Developer']) as any;
  });

  it('renders not-authorized when not authenticated', () => {
    render(wrap(defaultAuth));
    expect(screen.getByTestId('admin-venues-unauthorized')).toBeDefined();
  });

  it('renders not-authorized when the role is not allowed', () => {
    const otherAuth: Iauth = { ...adminAuth, user: { userType: 'clc-admin', email: 'x@y.com' } };
    render(wrap(otherAuth));
    expect(screen.getByTestId('admin-venues-unauthorized')).toBeDefined();
  });

  it('renders the page and loads venues for an admin', async () => {
    await act(async () => { render(wrap(adminAuth)); });
    expect(screen.getByTestId('admin-venues-page')).toBeDefined();
    expect(adminVenuesUtils.listVenues).toHaveBeenCalledWith('tk');
  });

  it('shows an error when listVenues rejects', async () => {
    adminVenuesUtils.listVenues = vi.fn(() => Promise.reject(new Error('boom'))) as any;
    await act(async () => { render(wrap(adminAuth)); });
    expect(screen.getByTestId('admin-venues-error').innerHTML).toBe('boom');
  });
});
