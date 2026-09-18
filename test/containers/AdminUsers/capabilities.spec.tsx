import {
  CAPABILITIES, CAPABILITY_GROUPS, USER_STATUS_OPTIONS, USER_ROLES, isAiAgent, isHumanUser,
} from 'src/containers/AdminUsers/capabilities';

const EXPECTED_CAPABILITIES = [
  'gig:create', 'gig:edit', 'gig:delete',
  'tour:create', 'tour:edit', 'tour:delete',
  'song:create', 'song:edit', 'song:delete',
  'book:create', 'book:edit', 'book:delete',
  'promo:email',
  'venue:create', 'venue:edit', 'venue:delete',
  'template:create', 'template:edit', 'template:delete',
  'outreach:create', 'outreach:edit', 'outreach:delete', 'outreach:approve',
  'venue-mining:create',
];

describe('AdminUsers capabilities registry', () => {
  it('contains exactly the 24 capabilities from the backend registry', () => {
    expect([...CAPABILITIES].sort()).toEqual([...EXPECTED_CAPABILITIES].sort());
    expect(CAPABILITIES.length).toBe(24);
  });

  it('includes venue-mining:create, outreach:approve, promo:email, and tour:* capabilities', () => {
    expect(CAPABILITIES).toContain('venue-mining:create');
    expect(CAPABILITIES).toContain('outreach:approve');
    expect(CAPABILITIES).toContain('promo:email');
    expect(CAPABILITIES).toContain('tour:create');
    expect(CAPABILITIES).toContain('tour:edit');
    expect(CAPABILITIES).toContain('tour:delete');
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

  it('CAPABILITY_GROUPS contains Venue mining, Promotion, Tours (legacy), and Outreach includes approve', () => {
    const venueMining = CAPABILITY_GROUPS.find((g) => g.label === 'Venue mining');
    expect(venueMining).toBeDefined();
    expect(venueMining?.items).toEqual(['venue-mining:create']);

    const promo = CAPABILITY_GROUPS.find((g) => g.label === 'Promotion');
    expect(promo).toBeDefined();
    expect(promo?.items).toEqual(['promo:email']);

    const tours = CAPABILITY_GROUPS.find((g) => g.label === 'Tours (legacy)');
    expect(tours).toBeDefined();
    expect(tours?.items).toEqual(['tour:create', 'tour:edit', 'tour:delete']);

    const outreach = CAPABILITY_GROUPS.find((g) => g.label === 'Outreach');
    expect(outreach).toBeDefined();
    expect(outreach?.items).toContain('outreach:approve');
  });

  it('USER_STATUS_OPTIONS includes human and ai-agent', () => {
    expect(USER_STATUS_OPTIONS).toContain('human');
    expect(USER_STATUS_OPTIONS).toContain('ai-agent');
  });

  it('USER_ROLES includes the artist-scoped tim-admin role', () => {
    expect(USER_ROLES).toContain('tim-admin');
  });

  it('isAiAgent and isHumanUser classify users correctly across all three outcomes', () => {
    // Outcome 1: AI Agent
    expect(isAiAgent('web-jam-llm', 'ai-agent')).toBe(true);
    expect(isHumanUser('web-jam-llm', 'ai-agent')).toBe(false);

    expect(isAiAgent('web-jam-llm', 'human')).toBe(true);
    expect(isHumanUser('web-jam-llm', 'human')).toBe(false);

    expect(isAiAgent('JaM-admin', 'ai-agent')).toBe(true);
    expect(isHumanUser('JaM-admin', 'ai-agent')).toBe(false);

    // Outcome 2: Human
    expect(isAiAgent('JaM-admin', 'human')).toBe(false);
    expect(isHumanUser('JaM-admin', 'human')).toBe(true);

    expect(isAiAgent('Developer', '')).toBe(false);
    expect(isHumanUser('Developer', '')).toBe(true);

    expect(isAiAgent('', 'human')).toBe(false);
    expect(isHumanUser('', 'human')).toBe(true);

    // Outcome 3: Indeterminate (empty role and status)
    expect(isAiAgent('', '')).toBe(false);
    expect(isHumanUser('', '')).toBe(false);
  });
});
