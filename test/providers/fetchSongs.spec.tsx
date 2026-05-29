/* eslint-disable @typescript-eslint/no-explicit-any */
import FetchSongs from 'src/providers/fetchSongs';

describe('fetchSongs', () => {
  afterEach(() => {
    (global.fetch as unknown) = undefined;
  });

  it('getSongs returns empty array', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('no network'))) as any;
    const newSongs = await FetchSongs.getSongs(vi.fn());
    expect(newSongs.length).toBe(0);
  });

  it('getSongs returns songs', async () => {
    const songs = [{
      category: '', title: '', url: '', _id: '', year: 2000,
    }, {
      category: '', title: '', url: '', _id: '', year: 2020,
    }, {
      category: '', title: '', url: '', _id: '', year: 1986,
    }];
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(songs),
    })) as any;
    const newSongs = await FetchSongs.getSongs(vi.fn());
    expect(newSongs.length).toBe(3);
  });

  it('getSongs does not fetch', async () => {
    window.location.href = 'http://localhost:8888/songs';
    const newSongs = await FetchSongs.getSongs(vi.fn());
    expect(newSongs.length).toBe(0);
  });
});
