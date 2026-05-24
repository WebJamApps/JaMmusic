import { render, screen, fireEvent } from '@testing-library/react';
import { GoogleButtons, loginConfig } from 'src/App/AppTemplate/GoogleButtons';
import utils from 'src/App/AppTemplate/GoogleButtons/utils';
import { AuthContext, defaultAuth } from 'src/providers/Auth.provider';

vi.mock('@react-oauth/google', () => ({
  useGoogleLogin: vi.fn(() => vi.fn()),
  googleLogout: vi.fn(),
}));

describe('GoogleButtons', () => {
  it('is defined', () => {
    expect(GoogleButtons).toBeDefined();
  });

  it('renders GoogleLogin button and runs events', () => {
    const props = {
      type: 'login', index: 1,
    };
    render(
      <AuthContext.Provider value={{ auth: defaultAuth, setAuth: vi.fn() }}>
        <GoogleButtons {...props} />
      </AuthContext.Provider>
    );
    const loginButton = screen.getByRole('button', { name: /login/i });
    expect(loginButton).toBeInTheDocument();
    fireEvent.click(loginButton);
  });

  it('runs loginConfig onSuccess and onError', () => {
    const setAuth = vi.fn();
    utils.responseGoogleLogin = vi.fn();
    const config = loginConfig(defaultAuth, setAuth);
    config.onSuccess({ code: 'token', scope: '' });
    expect(utils.responseGoogleLogin).toHaveBeenCalled();
    expect(config.onError()).toBe(false);
  });

  it('renders GoogleLogout button and handles click', () => {
    utils.responseGoogleLogout = vi.fn();
    const props = {
      type: 'logout', index: 1,
    };
    render(
      <AuthContext.Provider value={{ auth: defaultAuth, setAuth: vi.fn() }}>
        <GoogleButtons {...props} />
      </AuthContext.Provider>
    );
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);
    expect(utils.responseGoogleLogout).toHaveBeenCalled();
  });
});
});
