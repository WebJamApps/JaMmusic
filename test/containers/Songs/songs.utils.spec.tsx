import axios from 'axios';
import commonUtils from 'src/lib/utils';
import utils from 'src/containers/Songs/songs.utils';

jest.mock('axios');

describe('songs utils', () => {
  it('createSong', async () => {
    const getSongs = jest.fn();
    const setShowDialog = jest.fn();
    const setSong = jest.fn();
    const song = {
      category: '1', title: 'a', year: 12, url: 'https://test1.com',
    };
    const auth = {
      isAuthenticated: false, user: { userType: 'joker', email: '' }, error: '', token: '',
    };
    (axios.post as jest.Mock).mockResolvedValueOnce({});
    await utils.createSong(getSongs, setShowDialog, song, setSong, auth);
    expect(setShowDialog).toHaveBeenCalledWith(false);
    expect(getSongs).toHaveBeenCalled();
  });
  it('catches error', async () => {
    commonUtils.notify = jest.fn();
    const getSongs = jest.fn();
    const setShowDialog = jest.fn();
    const setSong = jest.fn();
    const song = {
      category: '1', title: 'a', year: 12, url: 'https://test1.com',
    };
    const auth = {
      isAuthenticated: false, user: { userType: 'joker', email: '' }, error: '', token: '',
    };
    const err = new Error('error');
    (axios.post as jest.Mock).mockRejectedValueOnce(err);
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
