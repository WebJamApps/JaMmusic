/* eslint-disable @typescript-eslint/no-explicit-any */
import env from 'dotenv';
import { App } from 'src/App';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import store from 'src/redux/store/index';

env.config();
describe('App component', () => {
  it('is defined', () => {
    expect(App).toBeDefined();
  });
  it('renders', () => {
    const props = {
      dispatch: jest.fn(), images: [], showMap: false, heartBeat: 'white', userCount: 0,
    };
    Object.defineProperty(window, 'location', { value: { assign: () => { }, reload: () => { } }, writable: true });
    window.location = {
      ...window.location,
      href: 'https://web-jam.com',
      origin: 'https://web-jam.com',
      reload: jest.fn(),
      assign: jest.fn(),
    };
    const app:any = renderer.create(<Provider store={store.store}><App {...props}><div /></App></Provider>).toJSON();
    expect(app.props.className).toBe('App');
  });
});
