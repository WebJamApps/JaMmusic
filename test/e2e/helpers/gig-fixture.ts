import { type Page } from '@playwright/test';

interface SocketPacket { event?: string; cid?: number; data?: { gig?: Record<string, unknown> } }
export async function fixture(page: Page, lookup: {
  suggestionStatus?: number; suggestions?: unknown; detailStatus?: number; details?: unknown;
  holdOldSearch?: Promise<void>; holdDetails?: Promise<void>;
} = {}) {
  const appOrigin = new URL(process.env.BASE_URL || 'http://localhost:7878').origin;
  const reads: { url: URL; authorization?: string }[] = [];
  const googleRequests: string[] = [];
  const venueWrites: Record<string, unknown>[] = [];
  const gigWrites: SocketPacket[] = [];
  const state = { venueFailure: false, socketResult: 'success' as 'success' | 'error' | 'timeout', venueStatus: 200 };
  await page.addInitScript(() => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ sub: 'user-123', exp: 9999999999 }));
    localStorage.setItem('auth', JSON.stringify({
      isAuthenticated: true, error: '', token: `${header}.${payload}.fixture`,
      user: { userType: 'Developer', email: 'fixture@example.com' },
    }));
  });
  const active = { _id: 'existing', name: 'Existing Hall', address: '9 First St', city: 'Salem', usState: 'VA', status: 'active' };
  const archived = { _id: 'archivedHall', name: 'The Hall', address: '1 Electric Rd', city: 'Salem', usState: 'VA', status: 'archived' };
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (['maps.googleapis.com', 'places.googleapis.com'].includes(url.hostname)) googleRequests.push(url.href);
    if (url.origin === 'http://localhost:7000') {
      let body: unknown = [];
      let status = 200;
      if (url.pathname.startsWith('/user/')) body = { userType: 'Developer', email: 'fixture@example.com' };
      if (url.pathname.startsWith('/venue/places/')) {
        reads.push({ url, authorization: route.request().headers().authorization });
        if (url.pathname.endsWith('/suggest')) {
          if (url.searchParams.get('input') === 'Old street') {
            await lookup.holdOldSearch;
            body = [{ placeId: 'old', text: 'Obsolete suggestion' }];
          } else {
            status = lookup.suggestionStatus || 200;
            body = lookup.suggestions ?? [{ placeId: 'place-1', text: '123 Campbell Ave, Roanoke' }];
          }
        } else {
          await lookup.holdDetails;
          status = lookup.detailStatus || 200;
          body = lookup.details ?? {
            street: '123 Campbell Ave', city: 'Roanoke', state: 'NC', country: 'US', zipCode: '24011', lat: 37.27, lng: -79.94,
          };
        }
      }
      if (url.pathname === '/venue') {
        if (route.request().method() === 'POST') {
          const payload = route.request().postDataJSON() as Record<string, unknown>;
          venueWrites.push(payload);
          status = state.venueFailure ? 400 : state.venueStatus;
          body = state.venueFailure ? { message: 'Several address-less venues match; choose an existing venue.' }
            : { ...payload, _id: 'archivedHall' };
        } else body = url.searchParams.get('status') === 'archived' ? [archived] : [active];
      }
      await route.fulfill({ status, json: body, headers: { 'access-control-allow-origin': '*' } });
    } else if (url.origin !== appOrigin) {
      await route.abort();
    } else await route.continue();
  });
  await page.routeWebSocket(/.*/, (socket) => {
    socket.onMessage((message) => {
      if (typeof message !== 'string' || !message.startsWith('{')) return;
      const packet = JSON.parse(message) as SocketPacket;
      if (packet.event === '#handshake') {
        socket.send(JSON.stringify({ rid: packet.cid, data: { id: 'fixture', pingTimeout: 20000, isAuthenticated: false } }));
      } else if (packet.event === '#subscribe') {
        socket.send(JSON.stringify({ rid: packet.cid }));
      } else if (packet.event === 'initial message') {
        socket.send(JSON.stringify({ event: 'allGigs', data: [{
          _id: 'gig1', datetime: '2099-10-20T19:00:00.000Z', venue: 'Extra detail', tickets: '', venueId: active,
        }] }));
        socket.send(JSON.stringify({ event: 'allPics', data: [] }));
      } else if (packet.event === 'newGig' || packet.event === 'editGig') {
        gigWrites.push(packet);
        if (state.socketResult === 'error') {
          socket.send(JSON.stringify({ event: 'socketError', data: { message: 'Gig save refused by socket' } }));
        } else if (state.socketResult === 'success') {
          socket.send(JSON.stringify({ event: '#publish', data: {
            channel: packet.event === 'newGig' ? 'gigCreated' : 'gigUpdated', data: {},
          } }));
        }
      }
    });
  });
  await page.goto('/music');
  return { state, venueWrites, gigWrites, reads, googleRequests };
}

export async function openGigDialog(page: Page, mode: 'create' | 'edit') {
  if (mode === 'create') await page.locator('.showCreateDialog').click();
  else await page.locator('.gigsDiv .MuiDataGrid-row[data-id="0"]').click();
  return page.getByRole('dialog', { name: mode === 'create' ? 'Create New Gig' : 'Edit Gig' });
}
