import { vi } from 'vitest';
import commonUtils from 'src/lib/utils';
import utils from 'src/containers/Songs/songs.utils';

describe('songs utils', () => {
  const axiosMock = { post: vi.fn() };
  beforeEach(() => {
    vi.spyOn(commonUtils, 'notify').mockImplementation(() => { });
  });

  it('createSong', async () => {
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
      isAuthenticated: false, user: { userType: 'joker', email: '' }, error: '', token: '',
    };
    axiosMock.post.mockResolvedValueOnce({});
    vi.stubGlobal('axios', axiosMock);
    await utils.createSong(getSongs, setShowDialog, song, setSong, auth);
    expect(setShowDialog).toHaveBeenCalledWith(false);
    expect(getSongs).toHaveBeenCalled();
  });
  it('catches error', async () => {
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
      isAuthenticated: false, user: { userType: 'joker', email: '' }, error: '', token: '',
    };
    const err = new Error('error');
    axiosMock.post.mockRejectedValueOnce(err);
    vi.stubGlobal('axios', axiosMock);
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
