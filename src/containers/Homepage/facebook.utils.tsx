import type { Iauth } from 'src/providers/Auth.provider';
import commonUtils from 'src/lib/utils';

// The WebJamLLC Facebook Page id. web-jam-back serves multiple pages keyed by
// pageId (web-jam-back#799); JaMmusic always asks for this one.
export const WEBJAMLLC_PAGE_ID = '365007513885497';

// Must match the version web-jam-back's FacebookController is pinned to.
export const FB_GRAPH_VERSION = 'v20.0';

// True when the signed-in user holds one of the configured roles — used to show
// the Reconnect button to an admin (only when the feed is stalled). The real
// gate is server-side (AUTH_ROLES.facebook); this is just UI.
export function isJamAdmin(auth: Iauth): boolean {
  if (!auth?.isAuthenticated || !process.env.userRoles) return false;
  try {
    const { roles } = JSON.parse(process.env.userRoles) as { roles: string[] };
    return !!auth.user.userType && roles.includes(auth.user.userType);
  } catch { return false; }
}

interface FbLoginResponse { authResponse?: { accessToken?: string } }
interface FbSdk {
  init: (opts: Record<string, unknown>) => void;
  login: (cb: (res: FbLoginResponse) => void, opts: { scope: string }) => void;
}
interface FbWindow extends Window { FB?: FbSdk; fbAsyncInit?: () => void }

// Load the Facebook JS SDK once. App id is public, so it's safe in the bundle;
// FB.init reads it from the env-injected value.
function loadFbSdk(): void {
  /* istanbul ignore if */
  if (typeof window === 'undefined') return;
  const w = window as unknown as FbWindow;
  if (w.FB || document.getElementById('facebook-jssdk')) return;
  w.fbAsyncInit = () => {
    w.FB?.init({
      appId: process.env.FB_APP_ID, version: FB_GRAPH_VERSION, cookie: false, xfbml: false,
    });
  };
  const js = document.createElement('script');
  js.id = 'facebook-jssdk';
  js.src = 'https://connect.facebook.net/en_US/sdk.js';
  document.body.appendChild(js);
}

// PUT the short-lived user token + pageId to web-jam-back, which derives + stores
// the never-expiring page token for that page (the app secret stays server-side).
// Split out of the FB.login callback because that callback must be a plain
// function — the Facebook SDK rejects an async callback.
async function sendPageToken(userToken: string, auth: Iauth, pageId: string): Promise<void> {
  try {
    const res = await fetch(`${process.env.BackendUrl}/facebook/token`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${auth.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userToken, pageId }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    commonUtils.notify('Facebook', 'Reconnected — the feed will refresh shortly', 'success');
  } catch (e) {
    commonUtils.notify('Facebook', `Reconnect failed, ${(e as Error).message}`, 'warning');
  }
}

// "Reconnect Facebook": admin logs in as the page admin → short-lived user token
// → sendPageToken to web-jam-back for the given pageId. NOTE: in the Facebook
// consent dialog, keep BOTH the WebJamLLC and CollegeLutheran pages checked —
// deselecting a page revokes the app's access to it (see README).
async function reconnectFacebookAPI(auth: Iauth, pageId: string): Promise<void> {
  const w = window as unknown as FbWindow;
  if (!w.FB) {
    commonUtils.notify('Facebook', 'Facebook is still loading — wait a moment and try again', 'warning');
    return;
  }
  await new Promise<void>((resolve) => {
    w.FB!.login((response: FbLoginResponse) => {
      const userToken = response?.authResponse?.accessToken;
      if (!userToken) {
        commonUtils.notify('Facebook', 'Login was cancelled', 'warning');
        resolve();
        return;
      }
      void sendPageToken(userToken, auth, pageId).finally(resolve);
    }, { scope: 'pages_show_list,pages_read_engagement' });
  });
}

export default { loadFbSdk, reconnectFacebookAPI };
