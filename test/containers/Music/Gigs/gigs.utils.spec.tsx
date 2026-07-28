import scc from 'socketcluster-client';
import utils from 'src/containers/Music/Gigs/gigs.utils';
import commonUtils from 'src/lib/utils';
import type { Iauth } from 'src/providers/Auth.provider';
import type { Igig } from 'src/providers/Data.provider';

describe('gigs.utils', () => {
  it('makeVenueValue when Our Past Performances', () => {
    const result = utils.makeVenueValue('Our Past Performances');
    expect(result.type).toBe('span');
  });
  it('properly sets the order for gigs', () => {
    const setGigsInOrder = vi.fn();
    const today = new Date().toISOString();
    let tomorrow: any, future: any, yesterday: any;
    yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday = new Date(yesterday).toISOString();
    tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow = new Date(tomorrow).toISOString();
    future = new Date(tomorrow);
    future.setDate(future.getDate() + 2);
    future = new Date(future).toISOString();
    const gigs = [{ datetime: tomorrow }, { datetime: yesterday }, { datetime: future },
    { datetime: today }, { datetime: tomorrow }] as Igig[];
    utils.orderGigs(gigs, setGigsInOrder, vi.fn());
    expect(setGigsInOrder).toHaveBeenCalled();
  });
  it('properly sets the order for gigs when we have many future gigs', () => {
    const setGigsInOrder = vi.fn();
    const setPageSize = vi.fn();
    const today = new Date().toISOString();
    let tomorrow: any, future: any, yesterday: any;
    yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday = new Date(yesterday).toISOString();
    tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow = new Date(tomorrow).toISOString();
    future = new Date(tomorrow);
    future.setDate(future.getDate() + 2);
    future = new Date(future).toISOString();
    const gigs = [
      { datetime: future }, { datetime: future },
      { datetime: future }, { datetime: future }, { datetime: future },
      { datetime: future }, { datetime: future }, { datetime: tomorrow },
      { datetime: yesterday }, { datetime: future }, { datetime: today }, { datetime: tomorrow },
    ] as Igig[];
    utils.orderGigs(gigs, setGigsInOrder, setPageSize);
    // Fixed default page size; the grid paginates (separator + past gigs are
    // reachable via the paginator).
    expect(setPageSize).toHaveBeenCalledWith(10);
  });
  it('makeVenue', () => {
    const venue: any = utils.makeVenue();
    const result = venue.renderCell({ value: 'value' });
    expect(result.type).toBe('div');
  });
  describe('deleteGig', () => {
    it('deleteGig successful via gigDeleted subscribe channel', async () => {
      commonUtils.delay = vi.fn(() => new Promise(() => { /* never resolves */ }));
      global.confirm = vi.fn(() => true);
      const transmit = vi.fn();
      const disconnect = vi.fn();
      const receiverNext = vi.fn(() => new Promise(() => { /* never resolves */ }));
      const subscribeNext = vi.fn(() => Promise.resolve({ value: {}, done: false }));
      const receiver = vi.fn(() => ({ createConsumer: () => ({ next: receiverNext }) }));
      const subscribe = vi.fn(() => ({ createConsumer: () => ({ next: subscribeNext }) }));
      scc.create = vi.fn(() => ({ transmit, receiver, subscribe, disconnect })) as any;

      const getGigs = vi.fn();
      const setEditGig = vi.fn();
      const setEditChanged = vi.fn();
      const result = await utils.deleteGig('id', getGigs, setEditGig, setEditChanged, 'token');
      expect(result).toBe('success');
      expect(subscribe).toHaveBeenCalledWith('gigDeleted');
      expect(getGigs).toHaveBeenCalled();
      expect(setEditGig).toHaveBeenCalled();
      expect(setEditChanged).toHaveBeenCalledWith(false);
      expect(disconnect).toHaveBeenCalled();
    });

    it('deleteGig surfaces a backend socketError', async () => {
      commonUtils.delay = vi.fn(() => new Promise(() => { /* never resolves */ }));
      commonUtils.notify = vi.fn();
      global.confirm = vi.fn(() => true);
      const transmit = vi.fn();
      const disconnect = vi.fn();
      const receiverNext = vi.fn(() => Promise.resolve({ value: { deleteGig: 'Delete failed' }, done: false }));
      const subscribeNext = vi.fn(() => new Promise(() => { /* never resolves */ }));
      const receiver = vi.fn(() => ({ createConsumer: () => ({ next: receiverNext }) }));
      const subscribe = vi.fn(() => ({ createConsumer: () => ({ next: subscribeNext }) }));
      scc.create = vi.fn(() => ({ transmit, receiver, subscribe, disconnect })) as any;

      const getGigs = vi.fn();
      const result = await utils.deleteGig('id', getGigs, vi.fn(), vi.fn(), 'token');
      expect(result).toBe('error');
      expect(commonUtils.notify).toHaveBeenCalledWith('Error deleting gig', 'Delete failed', 'danger');
      expect(getGigs).not.toHaveBeenCalled();
      expect(disconnect).toHaveBeenCalled();
    });

    it('deleteGig unconfirmed on timeout', async () => {
      commonUtils.delay = vi.fn(() => Promise.resolve());
      commonUtils.notify = vi.fn();
      global.confirm = vi.fn(() => true);
      const transmit = vi.fn();
      const disconnect = vi.fn();
      const receiverNext = vi.fn(() => new Promise(() => { /* never resolves */ }));
      const subscribeNext = vi.fn(() => new Promise(() => { /* never resolves */ }));
      const receiver = vi.fn(() => ({ createConsumer: () => ({ next: receiverNext }) }));
      const subscribe = vi.fn(() => ({ createConsumer: () => ({ next: subscribeNext }) }));
      scc.create = vi.fn(() => ({ transmit, receiver, subscribe, disconnect })) as any;

      const getGigs = vi.fn();
      const setEditGig = vi.fn();
      const setEditChanged = vi.fn();
      const result = await utils.deleteGig('id', getGigs, setEditGig, setEditChanged, 'token');
      expect(result).toBe('unconfirmed');
      expect(commonUtils.notify).toHaveBeenCalledWith('Delete gig', "Couldn't confirm — list refreshed", 'info');
      expect(commonUtils.notify).not.toHaveBeenCalledWith(expect.anything(), expect.anything(), 'danger');
      expect(getGigs).toHaveBeenCalled();
      expect(setEditGig).toHaveBeenCalled();
      expect(setEditChanged).toHaveBeenCalledWith(false);
      expect(disconnect).toHaveBeenCalled();
    });

    it('deleteGig returns error on confirm cancel', async () => {
      commonUtils.delay = vi.fn();
      global.confirm = vi.fn(() => false);
      const result = await utils.deleteGig('id', vi.fn(), vi.fn(), vi.fn(), 'token');
      expect(result).toBe('error');
    });

    it('deleteGig catches error', async () => {
      const getGigs = vi.fn();
      commonUtils.notify = vi.fn();
      commonUtils.delay = vi.fn(() => Promise.reject(new Error('failed')));
      global.confirm = vi.fn(() => true);
      const transmit = vi.fn();
      const disconnect = vi.fn();
      const receiverNext = vi.fn(() => new Promise(() => { /* never resolves */ }));
      const subscribeNext = vi.fn(() => new Promise(() => { /* never resolves */ }));
      const receiver = vi.fn(() => ({ createConsumer: () => ({ next: receiverNext }) }));
      const subscribe = vi.fn(() => ({ createConsumer: () => ({ next: subscribeNext }) }));
      scc.create = vi.fn(() => ({ transmit, receiver, subscribe, disconnect })) as any;

      const result = await utils.deleteGig('id', getGigs, vi.fn(), vi.fn(), 'token');
      expect(result).toBe('error');
      expect(getGigs).not.toHaveBeenCalled();
      expect(commonUtils.notify).toHaveBeenCalledWith('Error deleting gig', 'failed', 'danger');
      expect(disconnect).toHaveBeenCalled();
    });
  });

  describe('updateGig', () => {
    it('updateGig successful via gigUpdated subscribe channel', async () => {
      commonUtils.delay = vi.fn(() => new Promise(() => { /* never resolves */ }));
      const getGigs = vi.fn();
      const setEditGig = vi.fn();
      const setEditChanged = vi.fn();
      const transmit = vi.fn();
      const disconnect = vi.fn();
      const receiverNext = vi.fn(() => new Promise(() => { /* never resolves */ }));
      const subscribeNext = vi.fn(() => Promise.resolve({ value: {}, done: false }));
      const receiver = vi.fn(() => ({ createConsumer: () => ({ next: receiverNext }) }));
      const subscribe = vi.fn(() => ({ createConsumer: () => ({ next: subscribeNext }) }));
      scc.create = vi.fn(() => ({ transmit, receiver, subscribe, disconnect })) as any;

      const result = await utils.updateGig(getGigs, setEditGig, setEditChanged, {} as any, 'token');
      expect(result).toBe('success');
      expect(subscribe).toHaveBeenCalledWith('gigUpdated');
      expect(getGigs).toHaveBeenCalled();
      expect(setEditGig).toHaveBeenCalled();
      expect(setEditChanged).toHaveBeenCalledWith(false);
      expect(disconnect).toHaveBeenCalled();
    });

    it('updateGig surfaces a backend socketError', async () => {
      commonUtils.delay = vi.fn(() => new Promise(() => { /* never resolves */ }));
      commonUtils.notify = vi.fn();
      const transmit = vi.fn();
      const disconnect = vi.fn();
      const receiverNext = vi.fn(() => Promise.resolve({ value: { editGig: 'Update failed' }, done: false }));
      const subscribeNext = vi.fn(() => new Promise(() => { /* never resolves */ }));
      const receiver = vi.fn(() => ({ createConsumer: () => ({ next: receiverNext }) }));
      const subscribe = vi.fn(() => ({ createConsumer: () => ({ next: subscribeNext }) }));
      scc.create = vi.fn(() => ({ transmit, receiver, subscribe, disconnect })) as any;

      const getGigs = vi.fn();
      const result = await utils.updateGig(getGigs, vi.fn(), vi.fn(), {} as any, 'token');
      expect(result).toBe('error');
      expect(commonUtils.notify).toHaveBeenCalledWith('Error updating gig', 'Update failed', 'danger');
      expect(getGigs).not.toHaveBeenCalled();
      expect(disconnect).toHaveBeenCalled();
    });

    it('updateGig unconfirmed on timeout', async () => {
      commonUtils.delay = vi.fn(() => Promise.resolve());
      commonUtils.notify = vi.fn();
      const getGigs = vi.fn();
      const setEditGig = vi.fn();
      const setEditChanged = vi.fn();
      const transmit = vi.fn();
      const disconnect = vi.fn();
      const receiverNext = vi.fn(() => new Promise(() => { /* never resolves */ }));
      const subscribeNext = vi.fn(() => new Promise(() => { /* never resolves */ }));
      const receiver = vi.fn(() => ({ createConsumer: () => ({ next: receiverNext }) }));
      const subscribe = vi.fn(() => ({ createConsumer: () => ({ next: subscribeNext }) }));
      scc.create = vi.fn(() => ({ transmit, receiver, subscribe, disconnect })) as any;

      const result = await utils.updateGig(getGigs, setEditGig, setEditChanged, {} as any, 'token');
      expect(result).toBe('unconfirmed');
      expect(commonUtils.notify).toHaveBeenCalledWith('Update gig', "Couldn't confirm — list refreshed", 'info');
      expect(commonUtils.notify).not.toHaveBeenCalledWith(expect.anything(), expect.anything(), 'danger');
      expect(getGigs).toHaveBeenCalled();
      expect(setEditGig).toHaveBeenCalled();
      expect(setEditChanged).toHaveBeenCalledWith(false);
      expect(disconnect).toHaveBeenCalled();
    });

    it('updateGig catches error', async () => {
      commonUtils.delay = vi.fn(() => Promise.reject(new Error('failed')));
      commonUtils.notify = vi.fn();
      const getGigs = vi.fn();
      const transmit = vi.fn();
      const disconnect = vi.fn();
      const receiverNext = vi.fn(() => new Promise(() => { /* never resolves */ }));
      const subscribeNext = vi.fn(() => new Promise(() => { /* never resolves */ }));
      const receiver = vi.fn(() => ({ createConsumer: () => ({ next: receiverNext }) }));
      const subscribe = vi.fn(() => ({ createConsumer: () => ({ next: subscribeNext }) }));
      scc.create = vi.fn(() => ({ transmit, receiver, subscribe, disconnect })) as any;

      const result = await utils.updateGig(getGigs, vi.fn(), vi.fn(), {} as any, 'token');
      expect(result).toBe('error');
      expect(getGigs).not.toHaveBeenCalled();
      expect(commonUtils.notify).toHaveBeenCalledWith('Error updating gig', 'failed', 'danger');
      expect(disconnect).toHaveBeenCalled();
    });
  });

  describe('createGig', () => {
    it('createGig successful via gigCreated subscribe channel', async () => {
      commonUtils.delay = vi.fn(() => new Promise(() => { /* never resolves */ }));
      const getGigs = vi.fn();
      const setShowDialog = vi.fn();
      const transmit = vi.fn();
      const disconnect = vi.fn();
      const receiverNext = vi.fn(() => new Promise(() => { /* never resolves */ }));
      const subscribeNext = vi.fn(() => Promise.resolve({ value: {}, done: false }));
      const receiver = vi.fn(() => ({ createConsumer: () => ({ next: receiverNext }) }));
      const subscribe = vi.fn(() => ({ createConsumer: () => ({ next: subscribeNext }) }));
      scc.create = vi.fn(() => ({ transmit, receiver, subscribe, disconnect })) as any;

      const result = await utils.createGig(getGigs, setShowDialog, new Date(), 'item', 'item', 'item', 'item', { token: 'token' } as Iauth, 0, '');
      expect(result).toBe('success');
      expect(subscribe).toHaveBeenCalledWith('gigCreated');
      expect(getGigs).toHaveBeenCalled();
      expect(setShowDialog).toHaveBeenCalledWith(false);
      expect(disconnect).toHaveBeenCalled();
    });

    it('createGig surfaces a backend socketError', async () => {
      commonUtils.delay = vi.fn(() => new Promise(() => { /* never resolves */ }));
      commonUtils.notify = vi.fn();
      const transmit = vi.fn();
      const disconnect = vi.fn();
      const receiverNext = vi.fn(() => Promise.resolve({ value: { newGig: 'Create failed' }, done: false }));
      const subscribeNext = vi.fn(() => new Promise(() => { /* never resolves */ }));
      const receiver = vi.fn(() => ({ createConsumer: () => ({ next: receiverNext }) }));
      const subscribe = vi.fn(() => ({ createConsumer: () => ({ next: subscribeNext }) }));
      scc.create = vi.fn(() => ({ transmit, receiver, subscribe, disconnect })) as any;

      const getGigs = vi.fn();
      const setShowDialog = vi.fn();
      const result = await utils.createGig(getGigs, setShowDialog, new Date(), 'item', 'item', 'item', 'item', { token: 'token' } as Iauth, 0, '');
      expect(result).toBe('error');
      expect(commonUtils.notify).toHaveBeenCalledWith('Error creating gig', 'Create failed', 'danger');
      expect(getGigs).not.toHaveBeenCalled();
      expect(setShowDialog).not.toHaveBeenCalled();
      expect(disconnect).toHaveBeenCalled();
    });

    it('createGig unconfirmed on timeout', async () => {
      commonUtils.delay = vi.fn(() => Promise.resolve());
      commonUtils.notify = vi.fn();
      const getGigs = vi.fn();
      const setShowDialog = vi.fn();
      const transmit = vi.fn();
      const disconnect = vi.fn();
      const receiverNext = vi.fn(() => new Promise(() => { /* never resolves */ }));
      const subscribeNext = vi.fn(() => new Promise(() => { /* never resolves */ }));
      const receiver = vi.fn(() => ({ createConsumer: () => ({ next: receiverNext }) }));
      const subscribe = vi.fn(() => ({ createConsumer: () => ({ next: subscribeNext }) }));
      scc.create = vi.fn(() => ({ transmit, receiver, subscribe, disconnect })) as any;

      const result = await utils.createGig(getGigs, setShowDialog, new Date(), 'item', 'item', 'item', 'item', { token: 'token' } as Iauth, 0, '');
      expect(result).toBe('unconfirmed');
      expect(commonUtils.notify).toHaveBeenCalledWith('Create gig', "Couldn't confirm — list refreshed", 'info');
      expect(commonUtils.notify).not.toHaveBeenCalledWith(expect.anything(), expect.anything(), 'danger');
      expect(getGigs).toHaveBeenCalled();
      expect(setShowDialog).toHaveBeenCalledWith(false);
      expect(disconnect).toHaveBeenCalled();
    });

    it('createGig catches error', async () => {
      commonUtils.delay = vi.fn(() => Promise.reject(new Error('failed')));
      commonUtils.notify = vi.fn();
      const getGigs = vi.fn();
      const transmit = vi.fn();
      const disconnect = vi.fn();
      const receiverNext = vi.fn(() => new Promise(() => { /* never resolves */ }));
      const subscribeNext = vi.fn(() => new Promise(() => { /* never resolves */ }));
      const receiver = vi.fn(() => ({ createConsumer: () => ({ next: receiverNext }) }));
      const subscribe = vi.fn(() => ({ createConsumer: () => ({ next: subscribeNext }) }));
      scc.create = vi.fn(() => ({ transmit, receiver, subscribe, disconnect })) as any;

      const result = await utils.createGig(getGigs, vi.fn(), new Date(), 'item', 'item', 'item', 'item', { token: 'token' } as Iauth, 0, '');
      expect(result).toBe('error');
      expect(getGigs).not.toHaveBeenCalled();
      expect(commonUtils.notify).toHaveBeenCalledWith('Error creating gig', 'failed', 'danger');
      expect(disconnect).toHaveBeenCalled();
    });
  });
  it('checkUpdateDisabled branches', () => {
    const validGig = { datetime: new Date() };
    expect(utils.checkUpdateDisabled({}, false, 'existing', 'venueId', 'venue', '', '', '')).toBe(true);
    expect(utils.checkUpdateDisabled({}, true, 'existing', 'venueId', 'venue', '', '', '')).toBe(true);
    expect(utils.checkUpdateDisabled(validGig, true, 'existing', null, 'venue', '', '', '')).toBe(true);
    expect(utils.checkUpdateDisabled(validGig, true, 'existing', 'venueId', 'venue', '', '', '')).toBe(false);
    expect(utils.checkUpdateDisabled(validGig, true, 'new', 'venueId', 'venue', '', 'city', 'state')).toBe(true);
    expect(utils.checkUpdateDisabled(validGig, true, 'new', 'venueId', 'venue', 'name', 'city', 'state')).toBe(false);
    expect(utils.checkUpdateDisabled(validGig, true, 'none', 'venueId', '', '', '', '')).toBe(true);
    expect(utils.checkUpdateDisabled(validGig, true, 'none', 'venueId', '<p></p>', '', '', '')).toBe(true);
    expect(utils.checkUpdateDisabled(validGig, true, 'none', 'venueId', 'valid venue', '', '', '')).toBe(false);
    expect(utils.checkUpdateDisabled(validGig, true, 'invalid' as any, 'venueId', 'venue', '', '', '')).toBe(true);
  });
  it('checkNewDisabled branches', () => {
    expect(utils.checkNewDisabled(null, 'existing', 'venueId', 'venue', '', '', '')).toBe(true);
    expect(utils.checkNewDisabled(new Date(), 'existing', null, 'venue', '', '', '')).toBe(true);
    expect(utils.checkNewDisabled(new Date(), 'existing', 'venueId', 'venue', '', '', '')).toBe(false);
    expect(utils.checkNewDisabled(new Date(), 'new', 'venueId', 'venue', '', 'city', 'state')).toBe(true);
    expect(utils.checkNewDisabled(new Date(), 'new', 'venueId', 'venue', 'name', 'city', 'state')).toBe(false);
    expect(utils.checkNewDisabled(new Date(), 'none', 'venueId', '', '', '', '')).toBe(true);
    expect(utils.checkNewDisabled(new Date(), 'none', 'venueId', '<p></p>', '', '', '')).toBe(true);
    expect(utils.checkNewDisabled(new Date(), 'none', 'venueId', 'valid venue', '', '', '')).toBe(false);
    expect(utils.checkNewDisabled(new Date(), 'invalid' as any, 'venueId', 'venue', '', '', '')).toBe(true);
  });
  it('clickToEdit when isAdmin', () => {
    const setEditGig = vi.fn();
    utils.clickToEdit(setEditGig, true, {});
    expect(setEditGig).toHaveBeenCalled();
  });
  it('clickToEdit when not isAdmin', () => {
    const setEditGig = vi.fn();
    utils.clickToEdit(setEditGig, false, {});
    expect(setEditGig).not.toHaveBeenCalled();
  });
  it('makeTimeRange with and without duration', () => {
    const startIso = '2025-01-01T12:00:00.000Z';
    // Without duration
    const range1 = utils.makeTimeRange(startIso, 0, 'Virginia');
    expect(typeof range1).toBe('string');
    // With duration
    const range2 = utils.makeTimeRange(startIso, 3, 'Virginia');
    expect(range2).toContain('to');
  });
  it('makeVenue renderCell in various scenarios', () => {
    const makeVenueCol = utils.makeVenue();
    const renderCell = makeVenueCol.renderCell as any;

    // No row
    const cellNoRow = renderCell({ value: 'Test Venue' } as any);
    expect(cellNoRow.type).toBe('div');

    // Our Past Performances
    const cellPast = renderCell({ row: { venue: 'Our Past Performances' } } as any);
    expect(cellPast.type).toBe('span');

    // venueId with website and venue extra info
    const cellWithWebsiteAndExtra = renderCell({
      row: {
        venue: '<p>Extra gig details</p>',
        venueId: {
          name: 'The Durty Bull',
          city: 'Durham',
          usState: 'North Carolina',
          website: 'http://durtybull.com',
        },
      },
    } as any);
    expect(cellWithWebsiteAndExtra.type).toBe('div');

    // venueId without website and no extra info
    const cellNoWebsite = renderCell({
      row: {
        venue: '',
        venueId: {
          name: 'Anonymous Club',
          city: 'Chicago',
          usState: 'Illinois',
        },
      },
    } as any);
    expect(cellNoWebsite.type).toBe('div');

    // Fallback without venueId
    const cellFallback = renderCell({
      row: {
        venue: '<p>Direct Free Text Venue</p>',
      },
    } as any);
    expect(cellFallback.type).toBe('div');
  });
});
