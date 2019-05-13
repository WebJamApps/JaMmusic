import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import request from '../__mocks__/superagent';
import getImages from '../../src/store/fetchActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('async actions', () => {
  it('creates fetches', async () => {
    const store = mockStore({ images: { images: [] } });
    let result;
    try {
      result = await store.dispatch(getImages());
    } catch (e) { throw e; }
    expect(result.type).toBe('FETCHED_IMAGES');
  });
  it('does not fetch already have images', async () => {
    const store = mockStore({ images: { images: [{ _id: 1, url: '', title: 'empty' }] } });
    let result;
    try {
      result = await store.dispatch(getImages());
    } catch (e) { throw e; }
    expect(result).toBe(true);
  });
  it('returns a not found error', async () => {
    const store = mockStore({ images: { images: [] } });
    let result;
    request.setMockResponse({ body: { message: 'Not Found' } });
    try {
      result = await store.dispatch(getImages());
    } catch (e) { throw e; }
    expect(result.type).toBe('RECEIVE_ERROR');
  });
  it('returns a fetch error', async () => {
    const store = mockStore({ images: { images: [] } });
    let result;
    request.setMockError(new Error('bad'));
    try {
      result = await store.dispatch(getImages());
    } catch (e) { throw e; }
    expect(result.type).toBe('RECEIVE_ERROR');
  });
});
