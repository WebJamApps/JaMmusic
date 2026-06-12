/* eslint-disable @typescript-eslint/no-explicit-any */
import facebookUtils, { isJamAdmin, WEBJAMLLC_PAGE_ID } from 'src/containers/Homepage/facebook.utils';
import commonUtils from 'src/lib/utils';

const auth = {
  isAuthenticated: true,
  error: '',
  token: 'tok',
  user: { userType: 'Developer', email: 'a@b.c' },
};

const jsonHeaders = {
  Authorization: `Bearer ${auth.token}`,
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

describe('facebook.utils', () => {
  const origRoles = process.env.userRoles;
  afterEach(() => {
    vi.unstubAllGlobals();
    delete (window as any).FB;
    const existing = document.getElementById('facebook-jssdk');
    if (existing) existing.remove();
    if (origRoles === undefined) delete process.env.userRoles; else process.env.userRoles = origRoles;
  });

  describe('isJamAdmin', () => {
    beforeEach(() => { process.env.userRoles = JSON.stringify({ roles: ['Developer', 'jam-admin'] }); });

    it('true when the userType is a configured role', () => {
      expect(isJamAdmin(auth as any)).toBe(true);
    });
    it('false when not authenticated', () => {
      expect(isJamAdmin({ ...auth, isAuthenticated: false } as any)).toBe(false);
    });
    it('false when the userType is not a configured role', () => {
      expect(isJamAdmin({ ...auth, user: { userType: 'Nobody', email: '' } } as any)).toBe(false);
    });
    it('false when userRoles is unset', () => {
      delete process.env.userRoles;
      expect(isJamAdmin(auth as any)).toBe(false);
    });
  });

  describe('reconnect', () => {
    it('loadFbSdk appends the SDK script once', () => {
      facebookUtils.loadFbSdk();
      expect(document.getElementById('facebook-jssdk')).not.toBeNull();
      facebookUtils.loadFbSdk(); // idempotent
      expect(document.querySelectorAll('#facebook-jssdk')).toHaveLength(1);
    });

    it('loadFbSdk does nothing once FB is present', () => {
      (window as any).FB = { init: vi.fn(), login: vi.fn() };
      facebookUtils.loadFbSdk();
      expect(document.getElementById('facebook-jssdk')).toBeNull();
    });

    it('warns when the SDK is not loaded yet', async () => {
      commonUtils.notify = vi.fn();
      await facebookUtils.reconnectFacebookAPI(auth as any, WEBJAMLLC_PAGE_ID);
      expect(commonUtils.notify).toHaveBeenCalledWith('Facebook', expect.stringMatching(/still loading/), 'warning');
    });

    it('PUTs the user token + pageId (rerequesting the page picker) and notifies success', async () => {
      commonUtils.notify = vi.fn();
      const loginMock = vi.fn((cb: (r: any) => void) => cb({ authResponse: { accessToken: 'USER-TOKEN' } }));
      (window as any).FB = { init: vi.fn(), login: loginMock };
      const fetchMock = vi.fn(() => Promise.resolve({ ok: true, status: 200 }));
      vi.stubGlobal('fetch', fetchMock);
      await facebookUtils.reconnectFacebookAPI(auth as any, WEBJAMLLC_PAGE_ID);
      expect(loginMock).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ auth_type: 'rerequest' }),
      );
      expect(fetchMock).toHaveBeenCalledWith(
        `${process.env.BackendUrl}/facebook/token`,
        {
          method: 'PUT',
          headers: jsonHeaders,
          body: JSON.stringify({ userToken: 'USER-TOKEN', pageId: WEBJAMLLC_PAGE_ID }),
        },
      );
      expect(commonUtils.notify).toHaveBeenCalledWith('Facebook', expect.stringMatching(/Reconnected/), 'success');
    });

    it('warns when login is cancelled', async () => {
      commonUtils.notify = vi.fn();
      (window as any).FB = { init: vi.fn(), login: (cb: (r: any) => void) => cb({}) };
      await facebookUtils.reconnectFacebookAPI(auth as any, WEBJAMLLC_PAGE_ID);
      expect(commonUtils.notify).toHaveBeenCalledWith('Facebook', expect.stringMatching(/cancelled/), 'warning');
    });

    it('surfaces the backend error message when the PUT fails', async () => {
      commonUtils.notify = vi.fn();
      (window as any).FB = {
        init: vi.fn(),
        login: (cb: (r: any) => void) => cb({ authResponse: { accessToken: 'USER-TOKEN' } }),
      };
      vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
        ok: false, status: 400, json: () => Promise.resolve({ message: 'WebJamLLC page not found in /me/accounts' }),
      })));
      await facebookUtils.reconnectFacebookAPI(auth as any, WEBJAMLLC_PAGE_ID);
      expect(commonUtils.notify).toHaveBeenCalledWith(
        'Facebook', expect.stringMatching(/Reconnect failed.*page not found/), 'warning',
      );
    });
  });
});
