/* eslint-disable @typescript-eslint/no-explicit-any */
import env from 'dotenv';
import { App, checkAppName, checkBackendUrl } from 'src/App';
import renderer from 'react-test-renderer';
// import { Provider } from 'react-redux';
// import store from 'src/redux/store/index';
import { BrowserRouter } from 'react-router-dom';

env.config();
describe('App component', () => {
  it('is defined', () => {
    expect(App).toBeDefined();
  });
  // it('renders', () => {
  //   Object.defineProperty(window, 'location', { value: { assign: () => { }, reload: () => { } }, writable: true });
  //   window.location = {
  //     ...window.location,
  //     href: 'https://web-jam.com',
  //     origin: 'https://web-jam.com',
  //     reload: jest.fn(),
  //     assign: jest.fn(),
  //   };
  //   const app:any = renderer.create(<Provider store={store.store}><App /></Provider>).toJSON();
  //   expect(app.props.className).toBe('App');
  // });
  it('checkAppName and return <Music />', () => {
    process.env.APP_NAME = 'joshandmariamusic.com';
    const music:any = renderer.create(<BrowserRouter>{checkAppName()}</BrowserRouter>).toJSON();
    expect(music.props.className.includes('music')).toBe(true);
  });
  it('checkBackendUrl and return null', () => {
    process.env.BackendUrl = 'web-jam.com';
    const result = checkBackendUrl();
    expect(result).toBeNull();
  });
});
