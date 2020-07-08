import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import getSongs, { gotSongs } from '../../src/App/songsActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const store = mockStore({
  songs: {
    songs: [],
    error: '',
  },
});
describe('async actions', () => {
  const anyVar:any = {};

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
      ancestorOrigins: anyVar,
      hash: '',
      host: '',
      hostname: '',
      origin: '',
      port: '',
      protocol: '',
      assign: anyVar,
      reload: anyVar,
      replace: anyVar,
    };
    const data = await getSongs()(fn);
    expect(data).toBeTruthy();
    window.location = location;
  });
  it('test get songs when https', async () => {
    const { location } = window;
    delete window.location;
    window.location = {
      search: '?oneplayer=true&id=28ru9weis2309urihw9098ewuis',
      pathname: '/music/original',
      href: 'https://this.is.for.fun/',
      ancestorOrigins: anyVar,
      hash: '',
      host: '',
      hostname: '',
      origin: '',
      port: '',
      protocol: '',
      assign: anyVar,
      reload: anyVar,
      replace: anyVar,
    };
    const result = await store.dispatch<any>(getSongs());
    expect(result).toBe(true);
    window.location = location;
  });
});
