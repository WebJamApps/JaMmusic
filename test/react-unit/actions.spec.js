import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  updateName, updateWidescreen, updateRole, updateMenu
} from '../../src/store/actions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('actions', () => {
  it('does nothing', (done) => {
    const store = mockStore({
      name: 'Web JAM LLC',
      menu: '',
      role: '',
      widescreen: true
    });
    expect(store).not.toBe(undefined);
    done();
  });
  it('updates the app name', (done) => {
    const store = mockStore({
      name: 'Web JAM LLC',
      menu: '',
      role: '',
      widescreen: true
    });
    const result = store.dispatch(updateName('booya'));
    expect(result.type).toBe('UPDATE_NAME');
    done();
  });
  it('updates widescreen', (done) => {
    const store = mockStore({
      name: 'Web JAM LLC',
      menu: '',
      role: '',
      widescreen: true
    });
    const result = store.dispatch(updateWidescreen(false));
    expect(result.type).toBe('UPDATE_WIDESCREEN');
    done();
  });
  it('updates role', (done) => {
    const store = mockStore({
      name: 'Web JAM LLC',
      menu: '',
      role: '',
      widescreen: true
    });
    const result = store.dispatch(updateRole('supreme commander'));
    expect(result.type).toBe('UPDATE_ROLE');
    done();
  });
  it('updates menu', (done) => {
    const store = mockStore({
      name: 'Web JAM LLC',
      menu: '',
      role: '',
      widescreen: true
    });
    const result = store.dispatch(updateMenu('wj'));
    expect(result.type).toBe('UPDATE_MENU');
    done();
  });
});
