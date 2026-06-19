export const CAPABILITIES = [
  'gig:create',
  'gig:edit',
  'gig:delete',
  'song:create',
  'song:edit',
  'song:delete',
  'book:create',
  'book:edit',
  'book:delete',
  // Booking-outreach venue management (web-jam-back#819). Lets admins grant the
  // venue:* caps to AI agents / human admins from the Admin Users page. No
  // venue:read — reads are gated by holding any venue write cap (no :read caps).
  'venue:create',
  'venue:edit',
  'venue:delete',
] as const;

export type Capability = (typeof CAPABILITIES)[number];

export const CAPABILITY_GROUPS: { label: string; items: Capability[] }[] = [
  { label: 'Gigs', items: ['gig:create', 'gig:edit', 'gig:delete'] },
  { label: 'Songs', items: ['song:create', 'song:edit', 'song:delete'] },
  { label: 'Books', items: ['book:create', 'book:edit', 'book:delete'] },
  { label: 'Venues', items: ['venue:create', 'venue:edit', 'venue:delete'] },
];

export const USER_STATUS_OPTIONS = ['human', 'ai-agent'] as const;
export type UserStatus = (typeof USER_STATUS_OPTIONS)[number];

export const USER_ROLES = ['JaM-admin', 'Developer', 'clc-admin', 'web-jam-llm'] as const;
export type UserRole = (typeof USER_ROLES)[number];
