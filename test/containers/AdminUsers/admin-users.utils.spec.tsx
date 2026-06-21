import adminUtils from 'src/containers/AdminUsers/admin-users.utils';

const okJson = (data: unknown) => Promise.resolve({ ok: true, json: () => Promise.resolve(data) } as Response);
const failed = () => Promise.resolve({ ok: false, status: 500, statusText: 'Server Error' } as Response);

describe('AdminUsers utils', () => {
  describe('fetch-backed API calls', () => {
    let fetchMock: ReturnType<typeof vi.fn>;
    beforeEach(() => { fetchMock = vi.fn(); global.fetch = fetchMock as unknown as typeof fetch; });
    afterEach(() => { vi.restoreAllMocks(); });

    it('listUsers GETs with a bearer token and returns the array', async () => {
      fetchMock.mockReturnValue(okJson([{ _id: '1', name: 'A', email: 'a@b.c' }]));
      const users = await adminUtils.listUsers('tok');
      expect(users).toHaveLength(1);
      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toContain('/admin/user');
      expect((opts as RequestInit).headers).toMatchObject({ Authorization: 'Bearer tok' });
    });

    it('createUser POSTs the payload', async () => {
      fetchMock.mockReturnValue(okJson({ _id: '2', name: 'New', email: 'n@b.c' }));
      const u = await adminUtils.createUser('tok', { name: 'New', email: 'n@b.c' });
      expect(u._id).toBe('2');
      const opts = fetchMock.mock.calls[0][1] as RequestInit;
      expect(opts.method).toBe('POST');
      expect(JSON.parse(opts.body as string)).toMatchObject({ name: 'New' });
    });

    it('updateUser PUTs to the user id', async () => {
      fetchMock.mockReturnValue(okJson({ _id: '3', name: 'X', email: 'x@b.c' }));
      await adminUtils.updateUser('tok', '3', { privileges: ['venue:create'] });
      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toContain('/admin/user/3');
      expect((opts as RequestInit).method).toBe('PUT');
    });

    it('mintToken POSTs to /:id/token and returns the token string', async () => {
      fetchMock.mockReturnValue(okJson({ token: 'minted' }));
      const t = await adminUtils.mintToken('tok', '4');
      expect(t).toBe('minted');
      expect(fetchMock.mock.calls[0][0]).toContain('/admin/user/4/token');
    });

    it('deleteUser DELETEs the user id', async () => {
      fetchMock.mockReturnValue(okJson({}));
      await adminUtils.deleteUser('tok', '5');
      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toContain('/admin/user/5');
      expect((opts as RequestInit).method).toBe('DELETE');
    });

    it.each([
      ['listUsers', () => adminUtils.listUsers('t')],
      ['createUser', () => adminUtils.createUser('t', { name: 'n', email: 'e' })],
      ['updateUser', () => adminUtils.updateUser('t', '1', {})],
      ['mintToken', () => adminUtils.mintToken('t', '1')],
      ['deleteUser', () => adminUtils.deleteUser('t', '1')],
    ])('%s throws on a non-ok response', async (_name, call) => {
      fetchMock.mockReturnValue(failed());
      await expect(call()).rejects.toThrow('500');
    });
  });

  describe('getAllowedAdminRoles', () => {
    const originalEnv = process.env.NODE_ENV;
    afterEach(() => { process.env.NODE_ENV = originalEnv; });

    it('returns only JaM-admin in production', () => {
      process.env.NODE_ENV = 'production';
      const roles = adminUtils.getAllowedAdminRoles();
      expect(roles).toEqual(['JaM-admin', 'Developer', 'clc-admin']);
    });

    it('includes Developer in non-production', () => {
      process.env.NODE_ENV = 'development';
      const roles = adminUtils.getAllowedAdminRoles();
      expect(roles).toContain('JaM-admin');
      expect(roles).toContain('Developer');
    });
  });

  it('exports all expected API functions', () => {
    expect(typeof adminUtils.listUsers).toBe('function');
    expect(typeof adminUtils.createUser).toBe('function');
    expect(typeof adminUtils.updateUser).toBe('function');
    expect(typeof adminUtils.mintToken).toBe('function');
    expect(typeof adminUtils.deleteUser).toBe('function');
  });
});
