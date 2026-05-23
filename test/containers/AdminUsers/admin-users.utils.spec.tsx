import adminUtils from 'src/containers/AdminUsers/admin-users.utils';

describe('AdminUsers utils', () => {
  describe('getAllowedAdminRoles', () => {
    const originalEnv = process.env.NODE_ENV;
    afterEach(() => { process.env.NODE_ENV = originalEnv; });

    it('returns only JaM-admin in production', () => {
      process.env.NODE_ENV = 'production';
      const roles = adminUtils.getAllowedAdminRoles();
      expect(roles).toEqual(['JaM-admin']);
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
    expect(typeof adminUtils.updatePrivileges).toBe('function');
    expect(typeof adminUtils.mintToken).toBe('function');
    expect(typeof adminUtils.deleteUser).toBe('function');
  });
});
