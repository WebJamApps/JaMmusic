import {
  CAPABILITIES, CAPABILITY_GROUPS, USER_STATUS_OPTIONS, USER_ROLES,
} from 'src/containers/AdminUsers/capabilities';

describe('AdminUsers capabilities registry', () => {
  it('includes tour, song, book, venue, template, and outreach capabilities', () => {
    expect(CAPABILITIES).toContain('gig:create');
    expect(CAPABILITIES).toContain('song:create');
    expect(CAPABILITIES).toContain('book:delete');
    expect(CAPABILITIES).toContain('venue:create');
    for (const c of ['template:create', 'template:edit', 'template:delete',
      'outreach:create', 'outreach:edit', 'outreach:delete']) {
      expect(CAPABILITIES).toContain(c);
    }
  });

  it('does not include user:* capabilities', () => {
    for (const c of CAPABILITIES) expect(c.startsWith('user:')).toBe(false);
  });

  // tour/song/book reads are public & unauthenticated, so a read privilege
  // gates nothing; the backend registry omits them too.
  it('does not include any :read capabilities', () => {
    for (const c of CAPABILITIES) expect(c.endsWith(':read')).toBe(false);
  });

  it('CAPABILITY_GROUPS covers every capability exactly once', () => {
    const inGroups = CAPABILITY_GROUPS.flatMap((g) => g.items);
    expect(inGroups.sort()).toEqual([...CAPABILITIES].sort());
  });

  it('USER_STATUS_OPTIONS includes human and ai-agent', () => {
    expect(USER_STATUS_OPTIONS).toContain('human');
    expect(USER_STATUS_OPTIONS).toContain('ai-agent');
  });

  // The artist-scoped admin role (renamed from the generic artist-admin to
  // slug-derived tim-admin), so the /admin/users edit form can show and set
  // it without wiping it on save (TimShermanMusic#34).
  it('USER_ROLES includes the artist-scoped tim-admin role', () => {
    expect(USER_ROLES).toContain('tim-admin');
  });
});
