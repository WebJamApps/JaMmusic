import reducer from 'src/redux/reducers/authReducer';

describe('auth reducer', () => {
  it('returns the initial state', () => {
    expect(reducer(undefined as any, { type: '' })).toEqual(
      {
        isAuthenticated: false,
        error: '',
        token: '',
        user: { userType: '', email: '' },
      },
    );
  });
  it('handles LOGOUT', () => {
    expect(
      reducer(undefined as any, { type: 'LOGOUT' }),
    ).toEqual(
      {
        isAuthenticated: false,
        error: '',
        token: '',
        user: { userType: '', email: '' },
      },
    );
  });
  it('handles AUTH_ERROR', () => {
    expect(
      reducer(undefined as any, {
        type: 'AUTH_ERROR',
        error: { message: 'Error' },
      }),
    ).toEqual({
      isAuthenticated: false,
      error: 'Error',
      token: '',
      user: { userType: '', email: '' },
    });
  });
  it('handles AUTH_ERROR with no error', () => {
    expect(
      reducer(undefined as any, {
        type: 'AUTH_ERROR',
        error: undefined,
      }),
    ).toEqual(
      {
        isAuthenticated: false,
        error: undefined,
        token: '',
        user: { userType: '', email: '' },
      },
    );
  });
  it('handles SET_USER', () => {
    expect(
      reducer(undefined as any, {
        type: 'SET_USER',
        data: { name: 'Justin Bieber', email: 'j@b.com' },
        token: 'token',
      }),
    ).toEqual(
      {
        isAuthenticated: true,
        error: '',
        token: 'token',
        user: { name: 'Justin Bieber', email: 'j@b.com' },
      },
    );
  });
});
