import reducer from '../../../src/redux/reducers/authReducer';

describe('auth reducer', () => {
  it('returns the initial state', () => {
    expect(reducer(undefined, {})).toEqual(
      {
        isAuthenticated: false,
        error: '',
        email: '',
        token: '',
        user: {},
      },
    );
  });
  it('handles GOT_TOKEN', () => {
    expect(
      reducer(undefined, { type: 'GOT_TOKEN', data: { email: 'j@b.com', token: '123' } }),
    ).toEqual(
      {
        isAuthenticated: true,
        error: '',
        email: 'j@b.com',
        token: '123',
        user: {},
      },
    );
  });
  it('handles LOGOUT', () => {
    expect(
      reducer(undefined, { type: 'LOGOUT' }),
    ).toEqual(
      {
        isAuthenticated: false,
        error: '',
        email: '',
        token: '',
        user: {},
      },
    );
  });
  it('handles AUTH_ERROR', () => {
    expect(
      reducer(undefined, {
        type: 'AUTH_ERROR',
        error: { message: 'bad' },
      }),
    ).toEqual(
      {
        isAuthenticated: false,
        error: 'bad',
        email: '',
        token: '',
        user: {},
      },
    );
  });
  it('handles SET_USER', () => {
    expect(
      reducer(undefined, {
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
