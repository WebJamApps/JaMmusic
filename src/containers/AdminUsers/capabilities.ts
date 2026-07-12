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
  // Pitch-email template management (web-jam-back#822). No template:read.
  'template:create',
  'template:edit',
  'template:delete',
  // Booking-outreach send + log (web-jam-back#823/#836). No outreach:read.
  'outreach:create',
  'outreach:edit',
  'outreach:delete',
] as const;

export type Capability = (typeof CAPABILITIES)[number];

export const CAPABILITY_GROUPS: { label: string; items: Capability[] }[] = [
  { label: 'Gigs', items: ['gig:create', 'gig:edit', 'gig:delete'] },
  { label: 'Songs', items: ['song:create', 'song:edit', 'song:delete'] },
  { label: 'Books', items: ['book:create', 'book:edit', 'book:delete'] },
  { label: 'Venues', items: ['venue:create', 'venue:edit', 'venue:delete'] },
  { label: 'Templates', items: ['template:create', 'template:edit', 'template:delete'] },
  { label: 'Outreach', items: ['outreach:create', 'outreach:edit', 'outreach:delete'] },
];

export const USER_STATUS_OPTIONS = ['human', 'ai-agent'] as const;
export type UserStatus = (typeof USER_STATUS_OPTIONS)[number];

export const USER_ROLES = ['JaM-admin', 'Developer', 'clc-admin', 'tim-admin', 'web-jam-llm'] as const;
export type UserRole = (typeof USER_ROLES)[number];
