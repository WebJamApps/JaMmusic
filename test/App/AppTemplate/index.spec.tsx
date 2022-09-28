import { BrowserRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { AppTemplate } from 'src/App/AppTemplate';

describe('AppTemplate', () => {
  it('renders the component', () => {
    const props = {
      dispatch: jest.fn(),
      auth: {
        isAuthenticated: false, token: '', error: '', email: '', user: { userType: '' },
      },
      userCount: 0,
      heartBeat: 'white',
      history: {} as any,
      location: { pathname: '/' } as any,
      match: {} as any,
    };
    const at = renderer.create(
      <BrowserRouter><AppTemplate {...props}><div id="test-page" /></AppTemplate></BrowserRouter>,
    ).toJSON();
    expect(at).toMatchSnapshot();
  });
});
