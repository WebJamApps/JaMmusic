import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import { AuthContext, defaultAuth, type Iauth } from 'src/providers/Auth.provider';
import { ThemeContext, type Theme } from 'src/providers/Theme.provider';
import { AdminApi } from 'src/containers/AdminApi';
import adminApiUtils from 'src/containers/AdminApi/admin-api.utils';

const mockSwaggerUI = vi.fn((props: Record<string, unknown>) => (
  <div data-testid="swagger-ui-mock" data-props={JSON.stringify(props)} />
));

vi.mock('swagger-ui-react', () => ({
  default: (props: Record<string, unknown>) => mockSwaggerUI(props),
}));

const adminAuth: Iauth = {
  isAuthenticated: true,
  error: '',
  token: 'admin-token-xyz',
  user: { userType: 'JaM-admin', email: 'admin@web-jam.com' },
};

const devAuth: Iauth = {
  isAuthenticated: true,
  error: '',
  token: 'dev-token-abc',
  user: { userType: 'Developer', email: 'dev@web-jam.com' },
};

const wrap = (auth: Iauth, theme: Theme = 'light') => (
  <AuthContext.Provider value={{ auth, setAuth: () => { /* noop */ } }}>
    <ThemeContext.Provider value={{ theme, setTheme: () => { /* noop */ }, toggleTheme: () => { /* noop */ } }}>
      <AdminApi />
    </ThemeContext.Provider>
  </AuthContext.Provider>
);

describe('AdminApi container', () => {
  const sampleSpec = {
    openapi: '3.1.0',
    info: { title: 'web-jam-back API', version: '1.0.0' },
    paths: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(adminApiUtils, 'fetchOpenApi').mockResolvedValue(sampleSpec);
    vi.spyOn(adminApiUtils, 'getAllowedAdminRoles').mockReturnValue(['JaM-admin', 'Developer']);
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark-mode');
  });

  it('renders not-authorized when user is unauthenticated', () => {
    render(wrap(defaultAuth));
    expect(screen.getByTestId('admin-api-unauthorized')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-api-page')).not.toBeInTheDocument();
  });

  it('renders not-authorized when userType is not allowed', () => {
    const unallowedAuth: Iauth = {
      ...adminAuth,
      user: { userType: 'clc-admin', email: 'unallowed@web-jam.com' },
    };
    render(wrap(unallowedAuth));
    expect(screen.getByTestId('admin-api-unauthorized')).toBeInTheDocument();
  });

  it('fetches /openapi.json with the admin token and passes required SwaggerUI props for JaM-admin', async () => {
    await act(async () => {
      render(wrap(adminAuth, 'light'));
    });

    expect(screen.getByTestId('admin-api-page')).toBeInTheDocument();
    expect(adminApiUtils.fetchOpenApi).toHaveBeenCalledTimes(1);
    expect(adminApiUtils.fetchOpenApi).toHaveBeenCalledWith('admin-token-xyz');

    expect(mockSwaggerUI).toHaveBeenCalledTimes(1);
    expect(mockSwaggerUI).toHaveBeenCalledWith(
      expect.objectContaining({
        spec: sampleSpec,
        supportedSubmitMethods: [],
        validatorUrl: null,
        showExtensions: true,
      }),
    );
  });

  it('works for Developer role', async () => {
    await act(async () => {
      render(wrap(devAuth, 'light'));
    });

    expect(screen.getByTestId('admin-api-page')).toBeInTheDocument();
    expect(adminApiUtils.fetchOpenApi).toHaveBeenCalledWith('dev-token-abc');
  });

  it('sets the dark-mode class when the theme is dark', async () => {
    await act(async () => {
      render(wrap(adminAuth, 'dark'));
    });

    const pageElement = screen.getByTestId('admin-api-page');
    expect(pageElement).toHaveClass('dark-mode');
    expect(document.documentElement).toHaveClass('dark-mode');
  });

  it('does not set the dark-mode class when the theme is light', async () => {
    await act(async () => {
      render(wrap(adminAuth, 'light'));
    });

    const pageElement = screen.getByTestId('admin-api-page');
    expect(pageElement).not.toHaveClass('dark-mode');
    expect(document.documentElement).not.toHaveClass('dark-mode');
  });

  it('renders an error message from response.body when fetchOpenApi rejects', async () => {
    vi.spyOn(adminApiUtils, 'fetchOpenApi').mockRejectedValue({
      response: { body: { message: 'Server exploded' } },
    });

    await act(async () => {
      render(wrap(adminAuth, 'light'));
    });

    expect(screen.getByTestId('admin-api-error')).toBeInTheDocument();
    expect(screen.getByText('Server exploded')).toBeInTheDocument();
  });

  it('renders an error alert when fetchOpenApi rejects with a standard Error', async () => {
    vi.spyOn(adminApiUtils, 'fetchOpenApi').mockRejectedValue(new Error('Failed to fetch spec'));

    await act(async () => {
      render(wrap(adminAuth, 'light'));
    });

    expect(screen.getByTestId('admin-api-error')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch spec')).toBeInTheDocument();
    expect(mockSwaggerUI).not.toHaveBeenCalled();
  });
});
