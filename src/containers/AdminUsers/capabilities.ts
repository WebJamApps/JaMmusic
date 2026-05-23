export const CAPABILITIES = [
  'tour:read',
  'tour:create',
  'tour:edit',
  'tour:delete',
  'song:read',
  'song:create',
  'song:edit',
  'song:delete',
  'book:read',
  'book:create',
  'book:edit',
  'book:delete',
] as const;

export type Capability = (typeof CAPABILITIES)[number];

export const CAPABILITY_GROUPS: { label: string; items: Capability[] }[] = [
  { label: 'Tours', items: ['tour:read', 'tour:create', 'tour:edit', 'tour:delete'] },
  { label: 'Songs', items: ['song:read', 'song:create', 'song:edit', 'song:delete'] },
  { label: 'Books', items: ['book:read', 'book:create', 'book:edit', 'book:delete'] },
];

export const USER_STATUS_OPTIONS = ['human', 'ai-agent'] as const;
export type UserStatus = (typeof USER_STATUS_OPTIONS)[number];

export const USER_ROLES = ['JaM-admin', 'Developer', 'clc-admin', 'web-jam-llm'] as const;
export type UserRole = (typeof USER_ROLES)[number];
