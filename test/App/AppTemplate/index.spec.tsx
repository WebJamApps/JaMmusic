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
  // it('rerenders the component when menuOpen state changes', () => {
  //   const { wrapper } = setup();
  //   wrapper.setState({ menuOpen: true });
  //   expect(wrapper.find('div.open').length).toBe(1);
  // });
  // it('handles response from google login', async () => {
  //   authUtils.responseGoogleLogin = jest.fn(() => Promise.resolve());
  //   const wrapper2 = shallow<AppTemplate>(
  //     <AppTemplate
  //       dispatch={dFunc}
  //       location={location}
  //       history={anyProp}
  //       match={anyProp}
  //     />,
  //   );
  //   const gRes: any = {};
  //   const result = await wrapper2.instance().responseGoogleLogin(gRes);
  //   expect(result).toBe('true');
  // });
  // it('handles response from google logout', async () => {
  //   authUtils.responseGoogleLogout = jest.fn(() => true);
  //   const wrapper2 = shallow<AppTemplate>(<AppTemplate
  //     dispatch={dFunc}
  //     location={location}
  //     history={anyProp}
  //     match={anyProp}
  //   />);
  //   const result = await wrapper2.instance().responseGoogleLogout();
  //   expect(result).toBe(true);
  // });
  // it('renders the logout button', () => {
  //   const { wrapper } = setup();
  //   const logoutButton = wrapper.instance().googleButtons('logout', 5);
  //   const rLogout = shallow(logoutButton);
  //   expect(rLogout.find('div.googleLogout').length).toBe(1);
  // });
  // it('closes the menu without navigating away from the react app', () => {
  //   document.body.innerHTML = '<button class="googleLogin"/><button class="googleLogout"/>';
  //   const aProps: any = { dispatch: () => Promise.resolve(true) };
  //   const aT = new AppTemplate(aProps);
  //   aT.setState = () => { };
  //   const result = aT.close();
  //   expect(result).toBe(true);
  // });
  // it('closes the mobile menu on clicking escape key', () => {
  //   const aProps: any = { dispatch: () => Promise.resolve(true) };
  //   const aT = new AppTemplate(aProps);
  //   aT.setState = jest.fn(() => true);
  //   const result = aT.handleKeyPress({ key: 'Escape' });
  //   expect(result).toBe(true);
  // });
  // it('does not closes the mobile menu on clicking Enter key', () => {
  //   const aProps: any = { dispatch: () => Promise.resolve(true) };
  //   const aT = new AppTemplate(aProps);
  //   const result = aT.handleKeyPress({ key: 'Enter' });
  //   expect(result).toBe(null);
  // });
  // it('toggles the mobile menu on clicking Enter key', () => {
  //   const aProps: any = { dispatch: () => Promise.resolve(true) };
  //   const aT = new AppTemplate(aProps);
  //   aT.toggleMobileMenu = () => true;
  //   const result = aT.handleKeyMenu({ key: 'Enter' });
  //   expect(result).toBe(true);
  // });
  // it('does not toggle the mobile menu on clicking Escape key', () => {
  //   const aProps: any = { dispatch: () => Promise.resolve(true) };
  //   const aT = new AppTemplate(aProps);
  //   aT.toggleMobileMenu = () => true;
  //   const result = aT.handleKeyMenu({ key: 'Escape' });
  //   expect(result).toBe(null);
  // });
  // it('toggles the mobile menu', () => {
  //   const { wrapper } = setup();
  //   wrapper.instance().setState = jest.fn();
  //   wrapper.instance().toggleMobileMenu();
  //   expect(wrapper.instance().setState).toHaveBeenCalledWith({ menuOpen: true });
  // });
  // it('runs onAutoLoadFinished props from GoogleLogin component', () => {
  //   const wrapper2 = shallow<AppTemplate>(<AppTemplate
  //     dispatch={dFunc}
  //     location={location}
  //     history={anyProp}
  //     match={anyProp}
  //   />);
  //   const bu = wrapper2.instance().googleButtons('login', 1);
  //   const gb = shallow(bu);
  //   const auto = gb.find(GoogleLogin).get(0).props.onAutoLoadFinished(false);
  //   expect(auto).toBe(false);
  // });
  // it('runs make external link when joshandmariamusic.com', () => {
  //   process.env.APP_NAME = 'joshandmariamusic.com';
  //   const { wrapper } = setup();
  //   wrapper.instance().navLinks();
  //   expect(wrapper.find('a').exists()).toBe(true);
  // });
});
