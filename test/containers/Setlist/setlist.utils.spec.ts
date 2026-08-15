import { describe, it, expect, vi, beforeEach } from 'vitest';
import setlistUtils, {
  getAllowedAdminRoles,
  isUserAdmin,
  parseDuration,
  formatDuration,
  formatSongDuration,
  calculateTotalDuration,
  reorderItems,
  normalizeItemOrders,
  getSetlists,
  getSetlist,
  createSetlist,
  updateSetlist,
  deleteSetlist,
  getSongCatalog,
  ISetlistItem,
} from 'src/containers/Setlist/setlist.utils';
import * as fetchUtils from 'src/lib/fetch.utils';

describe('setlist.utils', () => {
  describe('getAllowedAdminRoles and isUserAdmin', () => {
    it('returns allowed admin roles', () => {
      const roles = getAllowedAdminRoles();
      expect(roles).toContain('JaM-admin');
      expect(roles).toContain('Developer');
      expect(roles).toContain('clc-admin');
      expect(roles).toContain('tim-admin');
      expect(roles).toContain('web-jam-llm');
    });

    it('returns false when auth is null or undefined or unauthenticated', () => {
      expect(isUserAdmin(null)).toBe(false);
      expect(isUserAdmin(undefined)).toBe(false);
      expect(isUserAdmin({ isAuthenticated: false, error: '', token: '', user: { userType: 'JaM-admin', email: '' } })).toBe(false);
      expect(isUserAdmin({ isAuthenticated: true, error: '', token: '', user: { userType: '', email: '' } })).toBe(false);
    });

    it('returns true when user has authorized role', () => {
      expect(isUserAdmin({ isAuthenticated: true, error: '', token: 't', user: { userType: 'JaM-admin', email: 'a@b.com' } })).toBe(true);
      expect(isUserAdmin({ isAuthenticated: true, error: '', token: 't', user: { userType: 'Developer', email: 'a@b.com' } })).toBe(true);
    });

    it('returns false when user has unauthorized role', () => {
      expect(isUserAdmin({ isAuthenticated: true, error: '', token: 't', user: { userType: 'Customer', email: 'a@b.com' } })).toBe(false);
    });
  });

  describe('parseDuration', () => {
    it('handles falsy / non-string values', () => {
      expect(parseDuration(undefined)).toBe(0);
      expect(parseDuration(null)).toBe(0);
      expect(parseDuration('')).toBe(0);
      expect(parseDuration('   ')).toBe(0);
    });

    it('handles numeric inputs', () => {
      expect(parseDuration(180)).toBe(180);
      expect(parseDuration(180.8)).toBe(180);
      expect(parseDuration(-10)).toBe(0);
      expect(parseDuration(NaN)).toBe(0);
      expect(parseDuration(Infinity)).toBe(0);
    });

    it('handles pure digit strings', () => {
      expect(parseDuration('215')).toBe(215);
      expect(parseDuration('0')).toBe(0);
    });

    it('handles clock format mm:ss and hh:mm:ss', () => {
      expect(parseDuration('3:45')).toBe(225);
      expect(parseDuration('03:45')).toBe(225);
      expect(parseDuration('1:02:30')).toBe(3750);
      expect(parseDuration('0:45')).toBe(45);
    });

    it('handles text duration formats', () => {
      expect(parseDuration('1h 20m 30s')).toBe(4830);
      expect(parseDuration('3m 45s')).toBe(225);
      expect(parseDuration('45s')).toBe(45);
      expect(parseDuration('2h')).toBe(7200);
      expect(parseDuration('15m')).toBe(900);
    });

    it('falls back to parseFloat for other formats', () => {
      expect(parseDuration('150.5')).toBe(150);
      expect(parseDuration('invalid')).toBe(0);
    });
  });

  describe('formatDuration', () => {
    it('formats 0 or negative seconds as 0s', () => {
      expect(formatDuration(0)).toBe('0s');
      expect(formatDuration(-10)).toBe('0s');
    });

    it('formats seconds only', () => {
      expect(formatDuration(45)).toBe('45s');
    });

    it('formats minutes and seconds', () => {
      expect(formatDuration(225)).toBe('3m 45s');
      expect(formatDuration(180)).toBe('3m');
    });

    it('formats hours, minutes, and seconds', () => {
      expect(formatDuration(3665)).toBe('1h 1m 5s');
      expect(formatDuration(7200)).toBe('2h');
      expect(formatDuration(7230)).toBe('2h 30s');
    });
  });

  describe('formatSongDuration', () => {
    it('returns empty string for zero / falsy duration', () => {
      expect(formatSongDuration(0)).toBe('');
      expect(formatSongDuration('')).toBe('');
      expect(formatSongDuration(undefined)).toBe('');
      expect(formatSongDuration(null)).toBe('');
    });

    it('formats mm:ss', () => {
      expect(formatSongDuration(225)).toBe('3:45');
      expect(formatSongDuration(65)).toBe('1:05');
      expect(formatSongDuration('3:45')).toBe('3:45');
    });

    it('formats h:mm:ss for durations >= 1 hour', () => {
      expect(formatSongDuration(3665)).toBe('1:01:05');
      expect(formatSongDuration(7200)).toBe('2:00:00');
    });
  });

  describe('calculateTotalDuration', () => {
    it('returns 0 for empty or invalid array', () => {
      expect(calculateTotalDuration(null)).toBe(0);
      expect(calculateTotalDuration(undefined)).toBe(0);
      expect(calculateTotalDuration([])).toBe(0);
    });

    it('calculates sum across all items', () => {
      const items: ISetlistItem[] = [
        { order: 1, title: 'Song 1', durationSeconds: 200 },
        { order: 2, title: 'Song 2', durationSeconds: 150 },
        { order: 3, title: 'Song 3', durationSeconds: undefined },
      ];
      expect(calculateTotalDuration(items)).toBe(350);
    });
  });

  describe('reorderItems and normalizeItemOrders', () => {
    const sampleItems: ISetlistItem[] = [
      { order: 1, title: 'A' },
      { order: 2, title: 'B' },
      { order: 3, title: 'C' },
    ];

    it('reorders items moving item forward', () => {
      const reordered = reorderItems(sampleItems, 0, 2);
      expect(reordered.map((i) => i.title)).toEqual(['B', 'C', 'A']);
      expect(reordered.map((i) => i.order)).toEqual([1, 2, 3]);
    });

    it('reorders items moving item backward', () => {
      const reordered = reorderItems(sampleItems, 2, 0);
      expect(reordered.map((i) => i.title)).toEqual(['C', 'A', 'B']);
      expect(reordered.map((i) => i.order)).toEqual([1, 2, 3]);
    });

    it('returns unchanged copy when indices are out of bounds or identical', () => {
      expect(reorderItems(sampleItems, -1, 1).map((i) => i.title)).toEqual(['A', 'B', 'C']);
      expect(reorderItems(sampleItems, 1, 5).map((i) => i.title)).toEqual(['A', 'B', 'C']);
      expect(reorderItems(sampleItems, 1, 1).map((i) => i.title)).toEqual(['A', 'B', 'C']);
    });

    it('normalizes item orders to 1..N', () => {
      const items: ISetlistItem[] = [
        { order: 99, title: 'X' },
        { order: 4, title: 'Y' },
      ];
      const normalized = normalizeItemOrders(items);
      expect(normalized[0].order).toBe(1);
      expect(normalized[1].order).toBe(2);
    });
  });

  describe('API methods', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('getSetlists calls customFetch with optional sort query', async () => {
      const spy = vi.spyOn(fetchUtils, 'customFetch').mockResolvedValueOnce({
        ok: true,
        json: async () => [{ _id: '1', title: 'Gig 1', items: [] }],
      } as unknown as Response);
      const res = await getSetlists('title');
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('/setlist?sort=title'));
      expect(res).toHaveLength(1);
    });

    it('getSetlists throws on non-ok response', async () => {
      vi.spyOn(fetchUtils, 'customFetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as unknown as Response);
      await expect(getSetlists()).rejects.toThrow('500 Internal Server Error');
    });

    it('getSetlists calls customFetch without query when no sort option', async () => {
      const spy = vi.spyOn(fetchUtils, 'customFetch').mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as unknown as Response);
      await getSetlists();
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\/setlist$/));
    });

    it('getSetlist calls customFetch for specific ID', async () => {
      const spy = vi.spyOn(fetchUtils, 'customFetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ _id: '123', title: 'Gig', items: [] }),
      } as unknown as Response);
      const res = await getSetlist('123', 'artist');
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('/setlist/123?sort=artist'));
      expect(res._id).toBe('123');
    });

    it('getSetlist throws on error', async () => {
      vi.spyOn(fetchUtils, 'customFetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as unknown as Response);
      await expect(getSetlist('123')).rejects.toThrow('404 Not Found');
    });

    it('createSetlist posts payload with token', async () => {
      const spy = vi.spyOn(fetchUtils, 'customFetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ _id: 'new-id', title: 'New', items: [] }),
      } as unknown as Response);
      const res = await createSetlist('test-token', { title: 'New', items: [] });
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('/setlist'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      );
      expect(res._id).toBe('new-id');
    });

    it('updateSetlist puts payload with token', async () => {
      const spy = vi.spyOn(fetchUtils, 'customFetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ _id: '123', title: 'Updated', items: [] }),
      } as unknown as Response);
      const res = await updateSetlist('test-token', '123', { title: 'Updated' });
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('/setlist/123'),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      );
      expect(res._id).toBe('123');
    });

    it('deleteSetlist sends DELETE request with token', async () => {
      const spy = vi.spyOn(fetchUtils, 'customFetch').mockResolvedValueOnce({
        ok: true,
      } as unknown as Response);
      await deleteSetlist('test-token', '123');
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('/setlist/123'),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      );
    });

    it('getSongCatalog calls GET /song', async () => {
      const spy = vi.spyOn(fetchUtils, 'customFetch').mockResolvedValueOnce({
        ok: true,
        json: async () => [{ _id: 's1', title: 'Song 1', artist: 'Artist' }],
      } as unknown as Response);
      const songs = await getSongCatalog();
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('/song'));
      expect(songs).toHaveLength(1);
    });

    it('default export includes notify and all functions', () => {
      expect(typeof setlistUtils.notify).toBe('function');
      expect(typeof setlistUtils.getSetlists).toBe('function');
      expect(typeof setlistUtils.getSongCatalog).toBe('function');
    });
  });
});
