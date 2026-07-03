/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, act, fireEvent } from '@testing-library/react';
import { AuthContext, defaultAuth, type Iauth } from 'src/providers/Auth.provider';
import { AdminVenues } from 'src/containers/AdminVenues';
import adminVenuesUtils, { type Ivenue } from 'src/containers/AdminVenues/admin-venues.utils';

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

    // Create the portal target div so that the portal in AdminVenues has a target
    const portal = document.createElement('div');
    portal.setAttribute('id', 'header-controls-portal');
    document.body.appendChild(portal);
  });

  afterEach(() => {
    const portal = document.getElementById('header-controls-portal');
    if (portal) {
      portal.remove();
    }
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

  it('opens the create dialog when Create is clicked', async () => {
    await act(async () => { render(wrap(adminAuth)); });
    const addButton = screen.getByTestId('admin-venues-add-button');
    await act(async () => { fireEvent.click(addButton); });
    expect(screen.getByTestId('edit-venue-dialog-title').innerHTML).toBe('Add Venue');
  });

  it('toggles Show archived and loads archived venues', async () => {
    adminVenuesUtils.listVenues = vi.fn(() => Promise.resolve([])) as any;
    await act(async () => { render(wrap(adminAuth)); });
    const toggle = screen.getByTestId('venues-show-archived-toggle');
    await act(async () => { fireEvent.click(toggle); });
    expect(adminVenuesUtils.listVenues).toHaveBeenLastCalledWith('tk', undefined, 'archived');
  });

  it('restores an archived venue', async () => {
    const archivedVenue: Ivenue = { _id: 'v2', name: 'Archived Mac', status: 'archived' };
    adminVenuesUtils.listVenues = vi.fn(() => Promise.resolve([archivedVenue])) as any;
    adminVenuesUtils.updateVenue = vi.fn(() => Promise.resolve({} as Ivenue)) as any;

    await act(async () => { render(wrap(adminAuth)); });
    
    // Toggle Show archived to show the archived row and restore button
    const toggle = screen.getByTestId('venues-show-archived-toggle');
    await act(async () => { fireEvent.click(toggle); });

    // Click Restore button on the row
    const restoreBtn = screen.getByTestId('venue-restore-v2');
    await act(async () => { fireEvent.click(restoreBtn); });

    expect(adminVenuesUtils.updateVenue).toHaveBeenCalledWith('tk', 'v2', { status: 'active' });
    expect(adminVenuesUtils.listVenues).toHaveBeenCalledTimes(3); // Initial + toggle archived + post-restore refresh
  });
});

