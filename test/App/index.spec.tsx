/* eslint-disable @typescript-eslint/no-explicit-any */
import env from 'dotenv';
import { App, LoadMap, HomeOrMusic } from 'src/App';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import store from 'src/redux/store/index';
import { BrowserRouter } from 'react-router-dom';

env.config();
describe('App component', () => {
  it('is defined', () => {
    expect(App).toBeDefined();
  });
  it('renders', () => {
    const props = {
      dispatch: jest.fn(), images: [], showMap: false, heartBeat: 'white', userCount: 0,
    };
    const app:any = renderer.create(<Provider store={store.store}><App {...props}><div /></App></Provider>).toJSON();
    expect(app.props.className).toBe('App');
  });
  it('HomeOrMusic when music', () => {
    const hOm:any = renderer.create(<HomeOrMusic appName="JaM" />).toJSON();
    expect(hOm.props.className).toBe('page-content music');
  });
  it('LoadMap when null', () => {
    const lm:any = renderer.create(<LoadMap backendUrl="https://web-jam.com" />).toJSON();
    expect(lm).toBeNull();
  });
  it('LoadMap when GoogleMap', () => {
    const lm = renderer.create(<BrowserRouter><LoadMap backendUrl="http://localhost:7000" /></BrowserRouter>).root;
    expect(lm.findByProps({ path: '/map' })).toBeDefined();
  });
});
