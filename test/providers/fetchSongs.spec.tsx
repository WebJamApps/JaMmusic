import FetchSongs from 'src/providers/fetchSongs';

describe('fetchSongs', () => {
  it('getSongs returns empty array', async () => {
    const newSongs = await FetchSongs.getSongs(jest.fn());
    expect(newSongs.length).toBe(0);
  });
  // it('getSongs returns songs', async () => {
  //   const songs = [{
  //     category: '', title: '', url: '', _id: '', year: 2000,
  //   }, {
  //     category: '', title: '', url: '', _id: '', year: 2020,
  //   }, {
  //     category: '', title: '', url: '', _id: '', year: 1986,
  //   }];
  //   const get:any = jest.fn(() => ({ set: () => Promise.resolve({ body: songs }) }));
  //   superagent.get = get;
  //   const newSongs = await FetchSongs.getSongs(jest.fn());
  //   expect(newSongs.length).toBe(3);
  // });
  // it('getSongs returns empty array', async () => {
  //   const get:any = jest.fn(() => ({ set: () => Promise.resolve({ body: {} }) }));
  //   superagent.get = get;
  //   const newSongs = await FetchSongs.getSongs(jest.fn());
  //   expect(newSongs.length).toBe(0);
  // });
  it('getSongs does not fetch', async () => {
    window.location.href = 'http://localhost:8888/songs';
    const newSongs = await FetchSongs.getSongs(jest.fn());
    expect(newSongs.length).toBe(0);
  });
});
