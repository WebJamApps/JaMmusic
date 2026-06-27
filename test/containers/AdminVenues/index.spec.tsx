/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, act, fireEvent } from '@testing-library/react';
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

  it('re-lists with the eligibleFor date when a target weekend is picked', async () => {
    await act(async () => { render(wrap(adminAuth)); });
    await act(async () => {
      fireEvent.change(screen.getByTestId('venues-target-date'), { target: { value: '2026-08-15' } });
    });
    expect(adminVenuesUtils.listVenues).toHaveBeenCalledWith('tk', '2026-08-15');
  });

  it('clears the target-weekend filter back to listing all venues', async () => {
    await act(async () => { render(wrap(adminAuth)); });
    await act(async () => {
      fireEvent.change(screen.getByTestId('venues-target-date'), { target: { value: '2026-08-15' } });
    });
    await act(async () => { fireEvent.click(screen.getByTestId('venues-clear-date')); });
    expect(adminVenuesUtils.listVenues).toHaveBeenLastCalledWith('tk');
  });

  it('archives a venue then refreshes', async () => {
    adminVenuesUtils.listVenues = vi.fn(() => Promise.resolve([{ _id: 'v1', name: 'Junk' }])) as any;
    adminVenuesUtils.deleteVenue = vi.fn(() => Promise.resolve()) as any;
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    await act(async () => { render(wrap(adminAuth)); });
    await act(async () => { fireEvent.click(screen.getByTestId('venue-delete-v1')); });
    expect(adminVenuesUtils.deleteVenue).toHaveBeenCalledWith('tk', 'v1');
    expect(adminVenuesUtils.listVenues).toHaveBeenCalledTimes(2); // initial + post-archive refresh
    confirmSpy.mockRestore();
  });

  it('surfaces an error when archiving fails', async () => {
    adminVenuesUtils.listVenues = vi.fn(() => Promise.resolve([{ _id: 'v1', name: 'Junk' }])) as any;
    adminVenuesUtils.deleteVenue = vi.fn(() => Promise.reject(new Error('archive failed'))) as any;
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    await act(async () => { render(wrap(adminAuth)); });
    await act(async () => { fireEvent.click(screen.getByTestId('venue-delete-v1')); });
    expect(screen.getByTestId('admin-venues-error').innerHTML).toBe('archive failed');
    confirmSpy.mockRestore();
  });
});
