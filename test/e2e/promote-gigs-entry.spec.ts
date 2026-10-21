import { test, expect, type Page } from '@playwright/test';

interface SocketPacket { event?: string; cid?: number; data?: { gig?: Record<string, unknown> } }
async function fixture(page: Page) {
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
    if (url.origin === 'http://localhost:7000') {
      let body: unknown = [];
      let status = 200;
      if (url.pathname.startsWith('/user/')) body = { userType: 'Developer', email: 'fixture@example.com' };
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
    } else if (url.origin !== 'http://localhost:7878') {
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
  return { state, venueWrites, gigWrites };
}

async function openGigDialog(page: Page, mode: 'create' | 'edit') {
  if (mode === 'create') await page.locator('.showCreateDialog').click();
  else await page.locator('.gigsDiv .MuiDataGrid-row[data-id="0"]').click();
  return page.getByRole('dialog', { name: mode === 'create' ? 'Create New Gig' : 'Edit Gig' });
}

async function openDialog(page: Page, mode: 'create' | 'edit') {
  const dialog = await openGigDialog(page, mode);
  await dialog.getByLabel('Create New Venue', { exact: true }).check();
  await dialog.getByLabel('* Venue Name', { exact: true }).fill(' The Hall ');
  await dialog.getByLabel('* Street Address', { exact: true }).fill('1 Electric Road');
  await dialog.getByLabel('* City', { exact: true }).fill(' Salem ');
  await dialog.getByLabel('* Zip Code', { exact: true }).fill('24153');
  await expect(dialog.getByText(/1 Electric Rd.*\[archived\]/)).toBeVisible();
  const submit = dialog.getByRole('button', { name: mode === 'create' ? 'Create' : 'Update', exact: true });
  await expect(submit).toBeEnabled();
  return { dialog, submit };
}

for (const mode of ['create', 'edit'] as const) {
  test(`${mode}: typed validation, separate venue/gig failures and unchanged retry`, async ({ page }) => {
    const { state, venueWrites, gigWrites } = await fixture(page);
    const { dialog, submit } = await openDialog(page, mode);
    await dialog.getByLabel('* Street Address', { exact: true }).fill('   ');
    await expect(submit).toBeDisabled();
    await dialog.getByLabel('* Street Address', { exact: true }).fill('1 Electric Road');
    await dialog.getByLabel('* Zip Code', { exact: true }).fill('bad');
    await expect(submit).toBeDisabled();
    await dialog.getByLabel('* Zip Code', { exact: true }).fill('24153-1234');
    await dialog.getByLabel('Website', { exact: true }).fill('bad-url');
    await expect(submit).toBeDisabled();
    await dialog.getByLabel('Website', { exact: true }).fill('hall.example.com');
    state.venueFailure = true;
    await submit.click();
    await expect(dialog.getByRole('alert')).toHaveText(/Several address-less/);
    expect(gigWrites).toHaveLength(0);
    await expect(dialog.getByLabel('Website', { exact: true })).toHaveValue('hall.example.com');
    state.venueFailure = false;
    state.socketResult = 'error';
    await submit.click();
    await expect(dialog.getByRole('alert')).toHaveText('Gig save refused by socket');
    await expect(dialog.getByText('Existing archived venue restored and updated', { exact: true })).toBeVisible();
    await expect(dialog.getByLabel('* Venue Name', { exact: true })).toHaveValue(' The Hall ');
    expect(venueWrites[1]).toEqual({
      name: 'The Hall', address: '1 Electric Road', city: 'Salem', usState: 'VA',
      zipCode: '24153-1234', website: 'https://hall.example.com', status: 'active',
    });
    expect(gigWrites[0].data?.gig?.venueId).toBe('archivedHall');
    state.socketResult = 'success';
    await submit.click();
    await expect(dialog).not.toBeVisible();
    expect(venueWrites).toHaveLength(2);
    expect(gigWrites).toHaveLength(2);
    await expect(page.locator('.gigsDiv > [role="status"]')).toContainText(mode === 'create' ? 'Gig created.' : 'Gig updated.');
    const reopened = await openGigDialog(page, mode);
    await expect(page.locator('.gigsDiv > [role="status"]')).toHaveCount(0);
    await reopened.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(reopened).not.toBeVisible();
  });

  test(`${mode}: optional website and unconfirmed gig outcome remain accurate after closing`, async ({ page }) => {
    const { state, venueWrites } = await fixture(page);
    const { dialog, submit } = await openDialog(page, mode);
    state.socketResult = 'timeout';
    state.venueStatus = 201;
    await submit.click();
    await expect(dialog).not.toBeVisible();
    expect(venueWrites[0].website).toBe('');
    await expect(page.locator('.gigsDiv > [role="status"]')).toHaveText("Venue created. Couldn't confirm gig save — list refreshed.");
  });

  test(`${mode}: cancel leaves both venue and gig unsaved`, async ({ page }) => {
    const { venueWrites, gigWrites } = await fixture(page);
    const { dialog } = await openDialog(page, mode);
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(dialog).not.toBeVisible();
    expect(venueWrites).toHaveLength(0);
    expect(gigWrites).toHaveLength(0);
  });

  test(`${mode}: picking an existing venue saves its ID without a venue write`, async ({ page }) => {
    const { venueWrites, gigWrites } = await fixture(page);
    const dialog = await openGigDialog(page, mode);
    const search = dialog.getByRole('combobox', { name: '* Search Venues', exact: true });
    await search.fill('');
    await search.click();
    await expect(page.getByRole('option', { name: 'Existing Hall', exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: 'The Hall', exact: true })).toHaveCount(0);
    await search.fill('Existing');
    await page.getByRole('option', { name: 'Existing Hall', exact: true }).click();
    await dialog.getByRole('button', { name: mode === 'create' ? 'Create' : 'Update', exact: true }).click();
    await expect(dialog).not.toBeVisible();
    expect(venueWrites).toHaveLength(0);
    expect(gigWrites[0].data?.gig?.venueId).toBe('existing');
  });
}
