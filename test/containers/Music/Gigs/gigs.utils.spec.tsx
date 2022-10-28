import utils from 'src/containers/Music/Gigs/gigs.utils';
import commonUtils from 'src/lib/commonUtils';
import type { IGig } from 'src/providers/Data.provider';

describe('gigs.utils', () => {
  it('makeVenueValue when Our Past Performances', () => {
    const result = utils.makeVenueValue('Our Past Performances');
    expect(result.type).toBe('span');
  });
  it('properly sets the order for gigs', () => {
    const setGigsInOrder = jest.fn();
    const today = new Date().toISOString();
    let tomorrow:any, future:any, yesterday:any;
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
      { datetime: today }, { datetime: tomorrow }] as IGig[];
    utils.orderGigs(gigs, setGigsInOrder, jest.fn());
    expect(setGigsInOrder).toHaveBeenCalled();
  });
  it('properly sets the order for gigs when we have many future gigs', () => {
    const setGigsInOrder = jest.fn();
    const setPageSize = jest.fn();
    const today = new Date().toISOString();
    let tomorrow:any, future:any, yesterday:any;
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
    ] as IGig[];
    utils.orderGigs(gigs, setGigsInOrder, setPageSize);
    expect(setPageSize).toHaveBeenCalledWith(12);
  });
  it('makeVenue', () => {
    const venue:any = utils.makeVenue();
    const result = venue.renderCell({ value: 'value' });
    expect(result.type).toBe('span');
  });
  it('deleteGig fails', async () => {
    commonUtils.delay = jest.fn();
    global.confirm = jest.fn(() => true);
    const result = await utils.deleteGig('id', jest.fn(), jest.fn(), jest.fn());
    expect(result).toBe(false);
  });
  it('deleteGig successful', async () => {
    commonUtils.delay = jest.fn();
    const auth = JSON.stringify({ token: 'token' });
    const persistRoot = JSON.stringify({ auth });
    Storage.prototype.getItem = jest.fn(() => persistRoot);
    global.confirm = jest.fn(() => true);
    const result = await utils.deleteGig('id', jest.fn(), jest.fn(), jest.fn());
    expect(result).toBe(true);
  });
  it('deleteGig returns false', async () => {
    commonUtils.delay = jest.fn();
    const auth = JSON.stringify({ token: 'token' });
    const persistRoot = JSON.stringify({ auth });
    Storage.prototype.getItem = jest.fn(() => persistRoot);
    global.confirm = jest.fn(() => false);
    const result = await utils.deleteGig('id', jest.fn(), jest.fn(), jest.fn());
    expect(result).toBe(false);
  });
  it('updateGig successful', async () => {
    commonUtils.delay = jest.fn();
    const getGigs = jest.fn();
    const auth = JSON.stringify({ token: 'token' });
    const persistRoot = JSON.stringify({ auth });
    Storage.prototype.getItem = jest.fn(() => persistRoot);
    await utils.updateGig(getGigs, jest.fn(), jest.fn(), {} as any);
    expect(getGigs).toHaveBeenCalled();
  });
  it('updateGig catches', async () => {
    const getGigs = jest.fn();
    await utils.updateGig(getGigs, jest.fn(), jest.fn(), {} as any);
    expect(getGigs).not.toHaveBeenCalled();
  });
  it('createGig successful', async () => {
    commonUtils.delay = jest.fn();
    const getGigs = jest.fn();
    const auth = JSON.stringify({ token: 'token' });
    const persistRoot = JSON.stringify({ auth });
    Storage.prototype.getItem = jest.fn(() => persistRoot);
    await utils.createGig(getGigs, jest.fn(), new Date(), 'item', 'item', 'item', 'item');
    expect(getGigs).toHaveBeenCalled();
  });
  it('checkUpdateDisabled', () => {
    const editGig = {
      venue: 'venue', city: 'city', datetime: 'datetime', usState: 'usState',
    };
    expect(utils.checkUpdateDisabled(editGig, true)).toBe(false);
  });
  it('checkNewDisabled', () => {
    expect(utils.checkNewDisabled('city', 'city', new Date(), 'city')).toBe(false);
  });
  it('clickToEdit when isAdmin', () => {
    const setEditGig = jest.fn();
    utils.clickToEdit(setEditGig, true, {});
    expect(setEditGig).toHaveBeenCalled();
  });
  it('clickToEdit when not isAdmin', () => {
    const setEditGig = jest.fn();
    utils.clickToEdit(setEditGig, false, {});
    expect(setEditGig).not.toHaveBeenCalled();
  });
});
