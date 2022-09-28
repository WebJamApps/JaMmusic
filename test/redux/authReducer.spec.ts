import reducer from 'src/redux/reducers/authReducer';

describe('auth reducer', () => {
  it('returns the initial state', () => {
    expect(reducer(undefined as any, { type: '' })).toEqual(
      {
        isAuthenticated: false,
        error: '',
        email: '',
        token: '',
        user: { userType: '' },
      },
    );
  });
  it('handles GOT_TOKEN', () => {
    expect(
      reducer(undefined as any, { type: 'GOT_TOKEN', data: { email: 'j@b.com', token: '123' } }),
    ).toEqual(
      {
        isAuthenticated: true,
        error: '',
        email: 'j@b.com',
        token: '123',
        user: { userType: '' },
      },
    );
  });
  it('handles GOT_TOKEN with undefined data', () => {
    expect(
      reducer(undefined as any, { type: 'GOT_TOKEN', data: undefined }),
    ).toEqual(
      {
        isAuthenticated: true,
        error: '',
        email: '',
        token: '',
        user: { userType: '' },
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
        email: '',
        token: '',
        user: { userType: '' },
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
      email: '',
      token: '',
      user: { userType: '' },
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
        email: '',
        token: '',
        user: { userType: '' },
      },
    );
  });
  it('handles SET_USER', () => {
    expect(
      reducer(undefined as any, {
        type: 'SET_USER',
        data: { name: 'Justin Bieber' },
      }),
    ).toEqual(
      {
        isAuthenticated: false,
        error: '',
        email: '',
        token: '',
        user: { name: 'Justin Bieber' },
      },
    );
  });
});
