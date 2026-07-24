import { getAllowedAdminRoles } from '../AdminUsers/admin-users.utils';

// Outreach-specific API helpers (extracted from admin-venues.utils.ts per #1140).
// Thin client over the existing web-jam-back endpoints: GET /outreach/candidates,
// POST /outreach/batch, GET /outreach/preview, GET/PUT /outreach/config.

export interface Icandidate {
  _id: string;
  name: string;
  city?: string;
  venueType?: string;
  email?: string;
  reason?: {
    lastGigDate: string | null;
    gigIntervalMonths: number;
    nearestGigMonthsAway: number | null;
    spacingNote: string;
    resumeBookingExpired: boolean;
  };
}

export interface IbatchSkip { venueId: string; reason: string }
export interface IbatchResult {
  requested: number;
  sent: number;
  skipped: IbatchSkip[];
  records: unknown[];
}

export interface IpitchPreview {
  venueId: string;
  venueName: string;
  subject: string;
  body: string;
}

export interface Isuggestion {
  sentiment?: 'positive' | 'negative' | 'needs-info';
  proposedBookingStatus?: 'booking' | 'not-booking' | 'booked';
  proposedInterested?: boolean;
  rationale?: string;
  model?: string;
  reviewed?: boolean;
}

export interface IpendingReply {
  _id: string;
  venueId: string;
  templateUsed?: string;
  targetDates?: string;
  bookingPeriod?: string;
  sentAt?: string;
  status: 'sent' | 'replied' | 'declined' | 'booked' | 'no-response';
  messageId?: string;
  gmailThreadId?: string;
  repliedAt?: string;
  replySnippet?: string;
  suggestion?: Isuggestion;
  replyKind?: 'bounce';
  sentBy?: string;
  step?: number;
  nextTouchDue?: string;
}

const outreachUrl = `${process.env.BackendUrl}/outreach`;

function headers(token: string, json = false): Record<string, string> {
  const h: Record<string, string> = { Accept: 'application/json', Authorization: `Bearer ${token}` };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

async function getCandidates(token: string, targetDates?: string, eligibleFor?: string): Promise<Icandidate[]> {
  const qs = [];
  if (targetDates) qs.push(`targetDates=${encodeURIComponent(targetDates)}`);
  if (eligibleFor) qs.push(`eligibleFor=${encodeURIComponent(eligibleFor)}`);
  const query = qs.length > 0 ? `?${qs.join('&')}` : '';
  const res = await fetch(`${outreachUrl}/candidates${query}`, { headers: headers(token) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as Icandidate[];
}

async function sendBatch(
  token: string,
  payload: {
    venueIds: string[];
    targetDates: string;
    bookingPeriod?: string;
    targetWeekend: { start: string; end: string };
  },
): Promise<IbatchResult> {
  const res = await fetch(`${outreachUrl}/batch`, {
    method: 'POST', headers: headers(token, true), body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as IbatchResult;
}

async function getConfig(token: string): Promise<{ autoApprove: boolean }> {
  const res = await fetch(`${outreachUrl}/config`, { headers: headers(token) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as { autoApprove: boolean };
}

async function setConfig(token: string, autoApprove: boolean): Promise<{ autoApprove: boolean }> {
  const res = await fetch(`${outreachUrl}/config`, {
    method: 'PUT', headers: headers(token, true), body: JSON.stringify({ autoApprove }),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as { autoApprove: boolean };
}

async function getPreview(
  token: string, venueIds: string[], targetDates: string,
): Promise<IpitchPreview[]> {
  const qs = `?venueIds=${venueIds.join(',')}&targetDates=${encodeURIComponent(targetDates)}`;
  const res = await fetch(`${outreachUrl}/preview${qs}`, { headers: headers(token) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as IpitchPreview[];
}

async function getPendingReplies(token: string): Promise<IpendingReply[]> {
  const res = await fetch(`${outreachUrl}/replies/pending`, { headers: headers(token) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as IpendingReply[];
}

async function applySuggestion(
  token: string,
  id: string,
  payload: { bookingStatus?: string; interested?: boolean; dismiss?: boolean; reopen?: boolean },
): Promise<unknown> {
  const res = await fetch(`${outreachUrl}/${id}/apply-suggestion`, {
    method: 'POST', headers: headers(token, true), body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json();
}

async function recordOutcome(
  token: string,
  id: string,
  payload: { status: 'interested' | 'not-interested' | 'booked' | 'target-filled' | 'not-a-fit'; bookedDate?: string },
): Promise<unknown> {
  const res = await fetch(`${outreachUrl}/${id}/outcome`, {
    method: 'POST', headers: headers(token, true), body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json();
}

async function listOutreach(
  token: string,
  query?: { venueId?: string; status?: string },
): Promise<IpendingReply[]> {
  const qs = [];
  if (query?.venueId) qs.push(`venueId=${encodeURIComponent(query.venueId)}`);
  if (query?.status) qs.push(`status=${encodeURIComponent(query.status)}`);
  const qStr = qs.length > 0 ? `?${qs.join('&')}` : '';
  const res = await fetch(`${outreachUrl}${qStr}`, { headers: headers(token) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as IpendingReply[];
}

async function deleteOutreach(token: string, id: string): Promise<void> {
  const res = await fetch(`${outreachUrl}/${id}`, { method: 'DELETE', headers: headers(token) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
}

export default {
  getCandidates,
  sendBatch,
  getConfig,
  setConfig,
  getPreview,
  getAllowedAdminRoles,
  getPendingReplies,
  applySuggestion,
  deleteOutreach,
  recordOutcome,
  listOutreach,
};

