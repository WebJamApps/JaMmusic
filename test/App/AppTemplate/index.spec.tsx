import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { AppTemplate, defaultDispatch } from 'src/App/AppTemplate';

describe('AppTemplate', () => {
  it('defaultDispatch', () => {
    expect(defaultDispatch({})).toBeUndefined();
  });
  it('renders the component', () => {
    const props = {
      dispatch: jest.fn(),
      auth: {
        isAuthenticated: false, token: '', error: '', email: '', user: { userType: '' },
      },
      userCount: 0,
      heartBeat: 'white',
      history: {} as any, location: { pathname: '/' } as any, match: {} as any,
    };
    const at = renderer.create(
      <GoogleOAuthProvider clientId={process.env.GoogleClientId || ''}>
        <BrowserRouter><AppTemplate {...props}><div id="test-page"></div></AppTemplate></BrowserRouter>
      </GoogleOAuthProvider>,
    ).toJSON();
    expect(at).toMatchSnapshot();
  });
});
