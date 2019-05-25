
import getSongs, { gotSongs } from '../../src/containers/songsActions';

describe('async actions', () => {
  it('test got songs', async () => {
    const data = gotSongs('nothing');
    expect(data.type).toBe('GOT_SONGS');
  });

  it('test get songs', async () => {
    const { location } = window;
    delete window.location;

    const fn = jest.fn();
    
    window.location = {
      search: '?oneplayer=true&id=28ru9weis2309urihw9098ewuis',
      pathname: '/music/original',
      href: 'http://this.is.for.fun/',
    };

    const data = await getSongs()(fn);

    expect(data).toBeTruthy();

    window.location = location;
  });
});
