import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import scc from 'socketcluster-client';
import utils from 'src/containers/Music/Gigs/gigs.utils';
import commonUtils from 'src/lib/utils';
import * as fetchUtils from 'src/lib/fetch.utils';
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

      const editGigInput = {
        _id: '123',
        artist: 'josh',
        venue: 'The Spot',
      };
      const result = await utils.updateGig(getGigs, setEditGig, setEditChanged, editGigInput as any, 'token');
      expect(result).toBe('success');
      expect(subscribe).toHaveBeenCalledWith('gigUpdated');
      expect(transmit).toHaveBeenCalledWith('editGig', {
        gigId: '123',
        gig: expect.objectContaining({ artist: 'jammusic', venue: 'The Spot' }),
        token: 'token',
      });
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
      const onError = vi.fn();
      const result = await utils.updateGig(getGigs, vi.fn(), vi.fn(), {} as any, 'token', onError);
      expect(result).toBe('error');
      expect(onError).toHaveBeenCalledWith('Update failed');
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
      expect(transmit).toHaveBeenCalledWith('newGig', {
        gig: expect.objectContaining({ artist: 'jammusic' }),
        token: 'token',
      });
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
      const onError = vi.fn();
      const result = await utils.createGig(
        getGigs, setShowDialog, new Date(), 'item', 'item', 'item', 'item', { token: 'token' } as Iauth, 0, '', null, onError,
      );
      expect(result).toBe('error');
      expect(onError).toHaveBeenCalledWith('Create failed');
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
    expect(utils.checkUpdateDisabled(validGig, true, 'new', 'venueId', 'venue', 'name', 'city', 'VA', '1 Main St', '24153')).toBe(false);
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
    expect(utils.checkNewDisabled(new Date(), 'new', 'venueId', 'venue', 'name', 'city', 'VA', '1 Main St', '24153')).toBe(false);
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

  describe('normalizeUrl', () => {
    it('prefixes https:// when URL has no scheme', () => {
      expect(utils.normalizeUrl('www.petedyerivercourse.com')).toBe('https://www.petedyerivercourse.com');
      expect(utils.normalizeUrl('petedyerivercourse.com')).toBe('https://petedyerivercourse.com');
    });

    it('preserves existing http:// and https:// schemes', () => {
      expect(utils.normalizeUrl('http://www.petedyerivercourse.com')).toBe('http://www.petedyerivercourse.com');
      expect(utils.normalizeUrl('https://www.petedyerivercourse.com')).toBe('https://www.petedyerivercourse.com');
    });

    it('handles empty and whitespace strings', () => {
      expect(utils.normalizeUrl('')).toBe('');
      expect(utils.normalizeUrl('   ')).toBe('');
    });
  });

  describe('isFreeTextRenderable', () => {
    it('returns false when free-text venue merely restates linked venue name', () => {
      const freeText = '<a href="http://old.com">Pete Dye River Course</a>';
      expect(utils.isFreeTextRenderable(freeText, 'Pete Dye River Course')).toBe(false);
    });

    it('returns false when free-text differs only in whitespace, HTML tags, or case', () => {
      expect(utils.isFreeTextRenderable('<p>  PETE DYE RIVER COURSE </p>', 'Pete Dye River Course')).toBe(false);
    });

    it('returns true when free-text holds genuinely different extra info', () => {
      expect(utils.isFreeTextRenderable('<p>Patio Stage (Outdoors)</p>', 'Pete Dye River Course')).toBe(true);
    });

    it('returns false for empty, whitespace, or empty HTML paragraph free-text', () => {
      expect(utils.isFreeTextRenderable('', 'Pete Dye River Course')).toBe(false);
      expect(utils.isFreeTextRenderable('<p></p>', 'Pete Dye River Course')).toBe(false);
      expect(utils.isFreeTextRenderable('   ', 'Pete Dye River Course')).toBe(false);
    });
  });

  describe('renderVenueCell detailed behavior (Defects 1-4)', () => {
    it('renders a venue link with normalized https:// href for schemeless website, without trailing city/state (Defects 1 & 3)', () => {
      const renderCell = utils.makeVenue().renderCell as any;
      const cell = renderCell({
        row: {
          venue: '<a href="http://old.com">Pete Dye River Course</a>',
          venueId: {
            name: 'Pete Dye River Course',
            city: 'Radford',
            usState: 'VA',
            website: 'www.petedyerivercourse.com',
          },
        },
      });

      render(cell);
      const link = screen.getByRole('link', { name: 'Pete Dye River Course' });
      expect(link).toHaveAttribute('href', 'https://www.petedyerivercourse.com');
      expect(screen.queryByText(/- Radford, VA/i)).toBeNull();
    });

    it('renders venue name once when free-text merely restates linked venue name (Defect 4)', () => {
      const renderCell = utils.makeVenue().renderCell as any;
      const cell = renderCell({
        row: {
          venue: '<a href="http://old.com">Pete Dye River Course</a>',
          venueId: {
            name: 'Pete Dye River Course',
            city: 'Radford',
            usState: 'VA',
            website: 'https://www.petedyerivercourse.com',
          },
        },
      });

      render(cell);
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveTextContent('Pete Dye River Course');
    });

    it('renders extra info block when free-text carries genuinely different info (Defect 4)', () => {
      const renderCell = utils.makeVenue().renderCell as any;
      const cell = renderCell({
        row: {
          venue: 'Side Stage / Patio',
          venueId: {
            name: 'Pete Dye River Course',
            city: 'Radford',
            usState: 'VA',
            website: 'https://www.petedyerivercourse.com',
          },
        },
      });

      render(cell);
      expect(screen.getByRole('link', { name: 'Pete Dye River Course' })).toBeInTheDocument();
      expect(screen.getByText('Side Stage / Patio')).toBeInTheDocument();
    });

    it('renders bold name without anchor link when venue has no website (Defect 1 & no website)', () => {
      const renderCell = utils.makeVenue().renderCell as any;
      const cell = renderCell({
        row: {
          venue: '',
          venueId: {
            name: 'Salem Farmers Market',
            city: 'Salem',
            usState: 'VA',
          },
        },
      });

      render(cell);
      expect(screen.queryByRole('link')).toBeNull();
      expect(screen.getByText('Salem Farmers Market')).toBeInTheDocument();
      expect(screen.queryByText(/- Salem, VA/i)).toBeNull();
    });
  });

  describe('isUpcomingGig', () => {
    it('returns false for null, missing datetime, or separator row', () => {
      expect(utils.isUpcomingGig(null)).toBe(false);
      expect(utils.isUpcomingGig({ venue: 'Test', tickets: '', datetime: null })).toBe(false);
      expect(utils.isUpcomingGig({ venue: 'Our Past Performances', tickets: '', datetime: new Date() })).toBe(false);
      expect(utils.isUpcomingGig({ id: 999, venue: 'Test', tickets: '', datetime: new Date() })).toBe(false);
    });

    it('returns true for future dates and false for past dates', () => {
      const now = new Date('2026-10-31T12:00:00.000Z');
      const future = new Date('2026-11-05T18:00:00.000Z');
      const past = new Date('2026-10-20T18:00:00.000Z');

      expect(utils.isUpcomingGig({ venue: 'Future Gig', tickets: '', datetime: future }, now)).toBe(true);
      expect(utils.isUpcomingGig({ venue: 'Past Gig', tickets: '', datetime: past }, now)).toBe(false);
    });
  });

  describe('isWithin10Days', () => {
    it('returns false when datetime is null or undefined', () => {
      expect(utils.isWithin10Days(null)).toBe(false);
      expect(utils.isWithin10Days(undefined)).toBe(false);
    });

    it('returns true when gig is within 10 days in the future', () => {
      const now = new Date('2026-10-31T12:00:00.000Z');
      const in5Days = new Date('2026-11-05T18:00:00.000Z');
      const in10Days = new Date('2026-11-10T12:00:00.000Z');

      expect(utils.isWithin10Days(in5Days, now)).toBe(true);
      expect(utils.isWithin10Days(in10Days, now)).toBe(true);
    });

    it('returns false when gig is beyond 10 days in the future or in the past', () => {
      const now = new Date('2026-10-31T12:00:00.000Z');
      const in15Days = new Date('2026-11-15T18:00:00.000Z');
      const inPast = new Date('2026-10-25T18:00:00.000Z');

      expect(utils.isWithin10Days(in15Days, now)).toBe(false);
      expect(utils.isWithin10Days(inPast, now)).toBe(false);
    });
  });

  describe('fetchVenue', () => {
    it('returns venue data on successful GET request', async () => {
      const mockVenue = { _id: 'v123', name: 'Slow Play Brewing', instagramUsername: 'slowplaybeer' };
      vi.spyOn(fetchUtils, 'customFetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockVenue), { status: 200 }),
      );

      const result = await utils.fetchVenue('test-token', 'v123');
      expect(result).toEqual(mockVenue);
    });

    it('returns null on failure or error', async () => {
      vi.spyOn(fetchUtils, 'customFetch').mockResolvedValueOnce(
        new Response(null, { status: 500 }),
      );

      const result = await utils.fetchVenue('test-token', 'v123');
      expect(result).toBeNull();
    });

    it('handles thrown exceptions gracefully', async () => {
      vi.spyOn(fetchUtils, 'customFetch').mockRejectedValueOnce(new Error('Network error'));

      const result = await utils.fetchVenue('test-token', 'v123');
      expect(result).toBeNull();
    });
  });

  describe('announceGig', () => {
    it('returns success response when API returns 200 with instagram ok', async () => {
      vi.spyOn(fetchUtils, 'customFetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ instagram: { ok: true, id: 'post-999' } }), { status: 200 }),
      );

      const result = await utils.announceGig('token', 'gig-1', {
        caption: 'Test caption',
        userTags: ['maria', 'venue'],
      });
      expect(result.ok).toBe(true);
      expect(result.instagram?.id).toBe('post-999');
    });

    it('returns failure response with error message when API responds with error status', async () => {
      vi.spyOn(fetchUtils, 'customFetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({ message: 'userTags invalid', instagram: { ok: false, error: 'userTags invalid' } }),
          { status: 400 },
        ),
      );

      const result = await utils.announceGig('token', 'gig-1', {
        caption: 'Test caption',
        userTags: ['bad@handle'],
      });
      expect(result.ok).toBe(false);
      expect(result.instagram?.error).toBe('userTags invalid');
    });

    it('handles network throw gracefully', async () => {
      vi.spyOn(fetchUtils, 'customFetch').mockRejectedValueOnce(new Error('Connection dropped'));

      const result = await utils.announceGig('token', 'gig-1', {
        caption: 'Test caption',
        userTags: [],
      });
      expect(result.ok).toBe(false);
      expect(result.message).toBe('Connection dropped');
    });
  });
});
