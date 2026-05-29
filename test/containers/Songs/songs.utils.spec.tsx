import { vi } from 'vitest';
import commonUtils from 'src/lib/utils';
import utils from 'src/containers/Songs/songs.utils';

describe('songs utils', () => {

  it('createSong', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({}) }));
    commonUtils.notify = vi.fn();
    const getSongs = vi.fn();
    const setShowDialog = vi.fn();
    const setSong = vi.fn();
    const song = {
      artist: '',
      category: '1',
      title: 'a',
      year: 12,
      url: 'https://test1.com',
    };
    const auth = {
      isAuthenticated: true, user: { userType: 'admin', email: 'test@example.com' }, error: '', token: 'mock-token',
    };
    await utils.createSong(getSongs, setShowDialog, song, setSong, auth);
    expect(setShowDialog).toHaveBeenCalledWith(false);
    expect(getSongs).toHaveBeenCalled();
  });
  it('catches error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('error')));
    commonUtils.notify = vi.fn();
    const getSongs = vi.fn();
    const setShowDialog = vi.fn();
    const setSong = vi.fn();
    const song = {
      artist: '',
      category: '1',
      title: 'a',
      year: 12,
      url: 'https://test1.com',
    };
    const auth = {
      isAuthenticated: true, user: { userType: 'admin', email: 'test@example.com' }, error: '', token: 'mock-token',
    };
    const err = new Error('error');
    await utils.createSong(getSongs, setShowDialog, song, setSong, auth);
    expect(commonUtils.notify).toHaveBeenCalled();
  });
  it('checkDisabled', () => {
    const song = {
      category: '1', title: 'a', year: 12, url: 'https://test1.com', artist: 'joe',
    };
    const result = utils.checkDisabled(song);
    expect(result).toBe(false);
  });
});
