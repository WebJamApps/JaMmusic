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
      dispatch: jest.fn(), images: [], showMap: false,
    };
    const app:any = renderer.create(<Provider store={store.store}><App {...props}><div /></App></Provider>).toJSON();
    expect(app.props.className).toBe('App');
  });
  it('renders Google Map API when localhost', () => {
    process.env.BackendUrl = 'http://localhost:7000';
    expect('/map').toBeDefined();
  });
});
