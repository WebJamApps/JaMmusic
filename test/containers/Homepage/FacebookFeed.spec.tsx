/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '@testing-library/react';
import { AuthContext } from 'src/providers/Auth.provider';
import FacebookFeed from 'src/containers/Homepage/FacebookFeed';

const okJson = (data: unknown) => Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
const recent = new Date().toISOString();

const adminAuth = {
  isAuthenticated: true, error: '', token: 't', user: { userType: 'Developer', email: '' },
};
const anonAuth = {
  isAuthenticated: false, error: '', token: '', user: { userType: '', email: '' },
};

const renderWith = (auth: any) => render(
  <AuthContext.Provider value={{ auth, setAuth: () => {} }}>
    <FacebookFeed />
  </AuthContext.Provider>,
);

describe('FacebookFeed', () => {
  const origRoles = process.env.userRoles;
  beforeEach(() => { process.env.userRoles = JSON.stringify({ roles: ['Developer'] }); });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete (window as any).FB;
    const sdk = document.getElementById('facebook-jssdk');
    if (sdk) sdk.remove();
    if (origRoles === undefined) delete process.env.userRoles; else process.env.userRoles = origRoles;
  });

  it('shows the cards when the feed is fresh (for everyone)', async () => {
    vi.stubGlobal('fetch', vi.fn(() => okJson({ lastUpdated: recent, posts: [{ id: 'p1', message: 'Gig Friday' }] })));
    const { container } = renderWith(anonAuth);
    await screen.findByText('Gig Friday');
    expect(container.querySelector('.fbPost')).not.toBeNull();
    expect(container.querySelector('[data-testid="reconnect-facebook"]')).toBeNull();
    expect(container.querySelector('.fbUpdated')?.textContent).toMatch(/^Feed updated /);
  });

  it('shows the Reconnect button when stalled and an admin is signed in', async () => {
    vi.stubGlobal('fetch', vi.fn(() => okJson({ lastUpdated: null, posts: [] })));
    renderWith(adminAuth);
    expect(await screen.findByTestId('reconnect-facebook')).toBeTruthy();
  });

  it('renders nothing when stalled and not an admin', async () => {
    const fetchMock = vi.fn(() => okJson({ lastUpdated: null, posts: [] }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderWith(anonAuth);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(container.querySelector('[data-testid="reconnect-facebook"]')).toBeNull();
    expect(container.querySelector('.fbPost')).toBeNull();
  });

  it('shows the Reconnect button to an admin when the fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('down'))));
    renderWith(adminAuth);
    expect(await screen.findByTestId('reconnect-facebook')).toBeTruthy();
  });

  it('treats a stale (>7d) feed as stalled — admin sees Reconnect, no cards', async () => {
    const old = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    vi.stubGlobal('fetch', vi.fn(() => okJson({ lastUpdated: old, posts: [{ id: 'p1', message: 'stale' }] })));
    const { container } = renderWith(adminAuth);
    await screen.findByTestId('reconnect-facebook');
    expect(container.querySelector('.fbPost')).toBeNull();
  });
});
