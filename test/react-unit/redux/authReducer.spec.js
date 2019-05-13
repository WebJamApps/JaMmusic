import reducer from '../../../src/redux/reducers/authReducer';

describe('auth reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(
      {
        isAuthenticated: false,
        error: '',
        email: '',
        token: '',
      },
    );
  });
  it('should handle GOT_TOKEN', () => {
    expect(
      reducer(undefined, { type: 'GOT_TOKEN', data: { email: 'j@b.com', token: '123' } }),
    ).toEqual(
      {
        isAuthenticated: true,
        error: '',
        email: 'j@b.com',
        token: '123',
      },
    );
  });
  it('should handle LOGOUT', () => {
    expect(
      reducer(undefined, { type: 'LOGOUT' }),
    ).toEqual(
      {
        isAuthenticated: false,
        error: '',
        email: '',
        token: '',
      },
    );
  });
  it('should handle AUTH_ERROR', () => {
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
      },
    );
  });
});
