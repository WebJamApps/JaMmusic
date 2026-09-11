import { getAllowedAdminRoles } from '../AdminUsers/admin-users.utils';
import { customFetch } from 'src/lib/fetch.utils';

// Outreach-specific API helpers (extracted from admin-venues.utils.ts per #1140).
// Thin client over the existing web-jam-back endpoints: GET /outreach/candidates,
// POST /outreach/batch, GET /outreach/preview.

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

export interface IbatchSkip { venueId: string; venueName: string; reason: string }
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
  rationale?: string;
  model?: string;
  reviewed?: boolean;
}

// Stored outreach run reports index (web-jam-back#1084, D-52/D-53). Every
// record without `htmlContent` — the report itself is served publicly at
// `https://www.web-jam.com/outreach/report/<weekend>` and must never carry an
// auth header, since it opens on a device (a phone) with no admin session.
export interface IreportSummary {
  _id: string;
  weekend: string;
  title: string;
  candidatesCount: number;
  dispatchedCount: number;
  updated_at: string;
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
  const res = await customFetch(`${outreachUrl}/candidates${query}`, { headers: headers(token) });
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
  const res = await customFetch(`${outreachUrl}/batch`, {
    method: 'POST', headers: headers(token, true), body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as IbatchResult;
}

async function getPreview(
  token: string, venueIds: string[], targetDates: string,
): Promise<IpitchPreview[]> {
  const qs = `?venueIds=${venueIds.join(',')}&targetDates=${encodeURIComponent(targetDates)}`;
  const res = await customFetch(`${outreachUrl}/preview${qs}`, { headers: headers(token) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as IpitchPreview[];
}

async function getPendingReplies(token: string): Promise<IpendingReply[]> {
  const res = await customFetch(`${outreachUrl}/replies/pending`, { headers: headers(token) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as IpendingReply[];
}

async function applySuggestion(
  token: string,
  id: string,
  payload: { bookingStatus?: string; dismiss?: boolean; reopen?: boolean },
): Promise<unknown> {
  const res = await customFetch(`${outreachUrl}/${id}/apply-suggestion`, {
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
  const res = await customFetch(`${outreachUrl}/${id}/outcome`, {
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
  const res = await customFetch(`${outreachUrl}${qStr}`, { headers: headers(token) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as IpendingReply[];
}

async function deleteOutreach(token: string, id: string): Promise<void> {
  const res = await customFetch(`${outreachUrl}/${id}`, { method: 'DELETE', headers: headers(token) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
}

// GET /outreach/report — administrator-only index of stored run reports
// (web-jam-back#1084, D-52/D-53). Reading the index requires the admin
// token; the report pages themselves are public and are linked directly
// by the caller, never fetched through this helper.
async function getReportIndex(token: string): Promise<IreportSummary[]> {
  const res = await customFetch(`${outreachUrl}/report`, { headers: headers(token) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as IreportSummary[];
}

export default {
  getCandidates,
  sendBatch,
  getPreview,
  getAllowedAdminRoles,
  getPendingReplies,
  applySuggestion,
  deleteOutreach,
  recordOutcome,
  listOutreach,
  getReportIndex,
};

