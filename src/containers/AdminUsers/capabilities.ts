export const CAPABILITIES = [
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
  { label: 'Tours', items: ['tour:create', 'tour:edit', 'tour:delete'] },
  { label: 'Songs', items: ['song:read', 'song:create', 'song:edit', 'song:delete'] },
  { label: 'Books', items: ['book:read', 'book:create', 'book:edit', 'book:delete'] },
];

export const USER_STATUS_OPTIONS = ['human', 'ai-agent'] as const;
export type UserStatus = (typeof USER_STATUS_OPTIONS)[number];
