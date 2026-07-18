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
  it('deleteGig successful', async () => {
    commonUtils.delay = vi.fn();
    global.confirm = vi.fn(() => true);
    const result = await utils.deleteGig('id', vi.fn(), vi.fn(), vi.fn(), 'token');
    expect(result).toBe(true);
  });
  it('deleteGig returns false', async () => {
    commonUtils.delay = vi.fn();
    global.confirm = vi.fn(() => false);
    const result = await utils.deleteGig('id', vi.fn(), vi.fn(), vi.fn(), 'token');
    expect(result).toBe(false);
  });
  it('deleteGig catches error', async () => {
    const getGigs = vi.fn();
    commonUtils.delay = vi.fn(() => Promise.reject(new Error('failed')));
    global.confirm = vi.fn(() => true);
    await utils.deleteGig('id', getGigs, vi.fn(), vi.fn(), 'token');
    expect(getGigs).not.toHaveBeenCalled();
  });
  it('updateGig successful', async () => {
    commonUtils.delay = vi.fn();
    const getGigs = vi.fn();
    await utils.updateGig(getGigs, vi.fn(), vi.fn(), {} as any, 'token');
    expect(getGigs).toHaveBeenCalled();
  });
  it('updateGig catches error', async () => {
    commonUtils.delay = vi.fn(() => Promise.reject(new Error('failed')));
    const getGigs = vi.fn();
    await utils.updateGig(getGigs, vi.fn(), vi.fn(), {} as any, 'token');
    expect(getGigs).not.toHaveBeenCalled();
  });
  it('createGig successful', async () => {
    commonUtils.delay = vi.fn();
    const getGigs = vi.fn();
    await utils.createGig(getGigs, vi.fn(), new Date(), 'item', 'item', 'item', 'item', { token: 'token' } as Iauth, 0, '');
    expect(getGigs).toHaveBeenCalled();
  });
  it('createGig catches error', async () => {
    commonUtils.delay = vi.fn(() => Promise.reject(new Error('failed')));
    const getGigs = vi.fn();
    await utils.createGig(getGigs, vi.fn(), new Date(), 'item', 'item', 'item', 'item', { token: 'token' } as Iauth, 0, '');
    expect(getGigs).not.toHaveBeenCalled();
  });
  it('checkUpdateDisabled', () => {
    const editGig = {
      venue: 'venue', city: 'city', datetime: 'datetime', usState: 'usState',
    };
    expect(utils.checkUpdateDisabled(editGig, true, 'existing', 'venueId', 'venue', '', '', '')).toBe(false);
  });
  it('checkNewDisabled', () => {
    expect(utils.checkNewDisabled(new Date(), 'existing', 'venueId', 'venue', '', '', '')).toBe(false);
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
