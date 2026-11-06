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
  it('createSong omits empty url so sparse index does not collide', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({}) });
    vi.stubGlobal('fetch', fetchMock);
    const song = {
      artist: 'A',
      category: 'original',
      title: 'T',
      url: '',
    };
    const auth = {
      isAuthenticated: true, user: { userType: 'admin', email: 'test@example.com' }, error: '', token: 'mock-token',
    };
    await utils.createSong(vi.fn(), vi.fn(), song, vi.fn(), auth);
    const sentBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sentBody.url).toBeUndefined();
    expect(sentBody.title).toBe('T');
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
  const editSong = {
    _id: 'song1', artist: 'A', category: '1', title: 'a', year: 12, url: 'https://test1.com',
  };
  const editAuth = {
    isAuthenticated: true, user: { userType: 'admin', email: 'test@example.com' }, error: '', token: 'mock-token',
  };
  it('updateSong PUTs and refreshes on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({}) }));
    commonUtils.notify = vi.fn();
    const getSongs = vi.fn();
    const setShowDialog = vi.fn();
    const setSong = vi.fn();
    await utils.updateSong(getSongs, setShowDialog, editSong, setSong, editAuth);
    expect(setShowDialog).toHaveBeenCalledWith(false);
    expect(getSongs).toHaveBeenCalled();
  });
  it('updateSong omits empty url so sparse index does not collide', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({}) });
    vi.stubGlobal('fetch', fetchMock);
    const songToUpdate = {
      _id: 'song1',
      artist: 'A',
      category: 'original',
      title: 'T',
      url: '',
    };
    await utils.updateSong(vi.fn(), vi.fn(), songToUpdate, vi.fn(), editAuth);
    const sentBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sentBody.url).toBeUndefined();
  });
  it('updateSong notifies on error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, statusText: 'fail' }));
    commonUtils.notify = vi.fn();
    await utils.updateSong(vi.fn(), vi.fn(), editSong, vi.fn(), editAuth);
    expect(commonUtils.notify).toHaveBeenCalled();
  });
  it('handleInputChange updates the song and returns the value', () => {
    const setSong = vi.fn();
    const out = utils.handleInputChange({ target: { value: 'New' } }, setSong, editSong, 'title');
    expect(out).toBe('New');
    expect(setSong).toHaveBeenCalledWith(expect.objectContaining({ title: 'New' }));
  });
  it('checkDisabled allows songs without url or year when title, artist, category are present', () => {
    const song = {
      category: 'original', title: 'Song Title', artist: 'Artist Name',
    };
    expect(utils.checkDisabled(song as any)).toBe(false);
  });
  it('checkDisabled rejects when title, artist, or category is missing', () => {
    expect(utils.checkDisabled({ title: '', artist: 'A', category: 'original' } as any)).toBe(true);
    expect(utils.checkDisabled({ title: 'T', artist: '', category: 'original' } as any)).toBe(true);
    expect(utils.checkDisabled({ title: 'T', artist: 'A', category: '' } as any)).toBe(true);
  });
  const delSong = {
    _id: 'abc', artist: '', category: '1', title: 'a', year: 12, url: 'https://test1.com',
  };
  const delAuth = {
    isAuthenticated: true, user: { userType: 'admin', email: 'test@example.com' }, error: '', token: 'mock-token',
  };
  it('deleteSong when confirmed', async () => {
    vi.stubGlobal('confirm', vi.fn(() => true));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    const getSongs = vi.fn();
    const setShowDialog = vi.fn();
    await utils.deleteSong(getSongs, setShowDialog, delSong, delAuth);
    expect(setShowDialog).toHaveBeenCalledWith(false);
    expect(getSongs).toHaveBeenCalled();
  });
  it('deleteSong does nothing when cancelled', async () => {
    vi.stubGlobal('confirm', vi.fn(() => false));
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const getSongs = vi.fn();
    await utils.deleteSong(getSongs, vi.fn(), delSong, delAuth);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(getSongs).not.toHaveBeenCalled();
  });
  it('deleteSong notifies on error', async () => {
    vi.stubGlobal('confirm', vi.fn(() => true));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, statusText: 'fail' }));
    commonUtils.notify = vi.fn();
    await utils.deleteSong(vi.fn(), vi.fn(), delSong, delAuth);
    expect(commonUtils.notify).toHaveBeenCalled();
  });
  it('triggers auth:logout event on 401 response during createSong', async () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, statusText: 'Unauthorized' }));
    commonUtils.notify = vi.fn();
    await utils.createSong(vi.fn(), vi.fn(), { artist: '', category: '1', title: 'a', year: 12, url: 'u' }, vi.fn(), delAuth);
    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'auth:logout' }));
  });
});
