import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import request from '../../__mocks__/superagent';
import getImages from '../../../src/App/imageActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('async actions', () => {
  it('creates fetches', async () => {
    const store = mockStore({ images: { images: [] } });
    const result = await store.dispatch(getImages());
    expect(result.type).toBe('FETCHED_IMAGES');
  });
  it('does not fetch already have images', async () => {
    const store = mockStore({ images: { images: [{ _id: 1, url: '', title: 'empty' }] } });
    const result = await store.dispatch(getImages());
    expect(result).toBe(true);
  });
  it('returns a not found error', async () => {
    const store = mockStore({ images: { images: [] } });
    request.setMockResponse({ body: { message: 'Not Found' } });
    const result = await store.dispatch(getImages());
    expect(result.type).toBe('RECEIVE_ERROR');
  });
  it('returns a fetch error', async () => {
    const store = mockStore({ images: { images: [] } });
    request.setMockError(new Error('bad'));
    const result = await store.dispatch(getImages());
    expect(result.type).toBe('RECEIVE_ERROR');
  });
});
