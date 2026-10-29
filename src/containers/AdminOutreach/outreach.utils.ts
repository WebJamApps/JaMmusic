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
  lastPitchDate?: string | null;
  reason?: {
    lastGigDate: string | null;
    gigIntervalMonths: number;
    nearestGigMonthsAway: number | null;
    spacingNote: string;
    resumeBookingExpired: boolean;
  };
}

export interface IVenueCustomization {
  venueId: string;
  customIntro?: string;
  customBody?: string;
}

export interface IbatchSkip { venueId: string; venueName: string; reason: string }
export interface IbatchResult {
  requested: number;
  sent: number;
  skipped: IbatchSkip[];
  records: unknown[];
  remaining?: number;
  stopped?: { venueId: string; venueName: string; reason: string };
}

export type IdispatchChunk = Omit<IbatchResult, 'requested' | 'remaining'> & { remaining: number };

export interface IbatchPayload {
  venueIds: string[];
  targetDates: string;
  bookingPeriod?: string;
  targetWeekend: { start: string; end: string };
  batchId: string;
  venueCustomizations?: IVenueCustomization[];
}

export interface IvenueApproval {
  batchId: string;
  venueIds: string[];
  approver: string;
}

export interface IdraftFingerprint { venueId: string; subject: string; fingerprint: string }

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
  targetWeekend?: { start: string; end: string };
  sentAt?: string;
  status: 'sent' | 'replied' | 'declined' | 'booked' | 'no-response' | 'target-filled';
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
  if (!res.ok) throw await responseError(res);
  return await res.json() as Icandidate[];
}

async function responseError(res: Response): Promise<Error> {
  const fallback = `${res.status} ${res.statusText}`.trim();
  const text = await res.text().catch(() => '');
  try {
    const body: unknown = JSON.parse(text);
    if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string' && body.message.trim()) {
      return new Error(body.message);
    }
  } catch { /* Plain-text refusals are also shown verbatim. */ }
  return new Error(text.trim() || fallback);
}

async function postOutreach<T>(token: string, path: string, payload: unknown): Promise<T> {
  const res = await customFetch(`${outreachUrl}/${path}`, {
    method: 'POST', headers: headers(token, true), body: JSON.stringify(payload),
  });
  if (!res.ok) throw await responseError(res);
  return await res.json() as T;
}

async function sendBatch(token: string, payload: { dispatchId: string }): Promise<IdispatchChunk> {
  return postOutreach<IdispatchChunk>(token, 'batch', payload);
}

async function getVenueApproval(token: string, batchId: string): Promise<IvenueApproval | null> {
  const res = await customFetch(`${outreachUrl}/approval/gate1/${encodeURIComponent(batchId)}`, { headers: headers(token) });
  if (res.status === 404) return null;
  if (!res.ok) throw await responseError(res);
  const data = await res.json() as IvenueApproval;
  if (!data || !Array.isArray(data.venueIds) || data.venueIds.some(id => typeof id !== 'string')) {
    throw new Error('Could not read the stored venue approval. No approval was replaced.');
  }
  return data;
}

async function approveVenues(token: string, batch: IbatchPayload): Promise<unknown> {
  return postOutreach(token, 'approval/gate1', { ...batch, approver: 'Josh' });
}

async function approveDrafts(token: string, batch: IbatchPayload, draftFingerprints: IdraftFingerprint[]): Promise<unknown> {
  return postOutreach(token, 'approval/gate2', { ...batch, approver: 'Josh', draftFingerprints });
}

async function preflightBatch(token: string, batch: IbatchPayload): Promise<{ dispatchId: string; venueCount: number }> {
  const result = await postOutreach<{ dispatchId: string; venueCount: number }>(token, 'batch/preflight', batch);
  if (!result || typeof result.dispatchId !== 'string' || !result.dispatchId.trim() || result.venueCount !== batch.venueIds.length) {
    throw new Error('The batch check returned no valid dispatch. Nothing was sent.');
  }
  return result;
}

export function hasCompletePreviews(venueIds: string[], previews: IpitchPreview[]): boolean {
  return venueIds.length > 0 && previews.length === venueIds.length
    && previews.every(p => p && typeof p.venueId === 'string')
    && new Set(previews.map(p => p.venueId)).size === venueIds.length
    && venueIds.every(id => previews.some(p => p.venueId === id && typeof p.subject === 'string'
      && p.subject.trim() && typeof p.body === 'string' && p.body.trim()));
}

export async function fingerprintDraft(preview: IpitchPreview): Promise<IdraftFingerprint> {
  // Matches the server's computeDraftFingerprint({ subject, body }) exactly.
  const content = `${preview.subject.trim()}\n\n${preview.body.trim()}`;
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content));
  const fingerprint = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
  return { venueId: preview.venueId, subject: preview.subject, fingerprint };
}

async function getPreview(
  token: string,
  venueIds: string[],
  targetDates: string,
  bookingPeriod?: string,
  customizations?: { customIntro?: string; customBody?: string },
): Promise<IpitchPreview[]> {
  const qs = [
    `venueIds=${venueIds.map(id => encodeURIComponent(id)).join(',')}`,
    `targetDates=${encodeURIComponent(targetDates)}`,
  ];
  if (bookingPeriod) qs.push(`bookingPeriod=${encodeURIComponent(bookingPeriod)}`);
  if (customizations?.customIntro && customizations.customIntro.trim()) {
    qs.push(`customIntro=${encodeURIComponent(customizations.customIntro)}`);
  }
  if (customizations?.customBody && customizations.customBody.trim()) {
    qs.push(`customBody=${encodeURIComponent(customizations.customBody)}`);
  }
  const res = await customFetch(`${outreachUrl}/preview?${qs.join('&')}`, { headers: headers(token) });
  if (!res.ok) throw await responseError(res);
  const data: unknown = await res.json();
  if (!Array.isArray(data) || !hasCompletePreviews(venueIds, data as IpitchPreview[])) {
    throw new Error('A complete email preview is required for every selected venue. Nothing can be sent.');
  }
  return data as IpitchPreview[];
}

export async function dispatchApprovedBatch(
  token: string, batch: IbatchPayload, previews: IpitchPreview[], onProgress: (result: IbatchResult) => void,
): Promise<IbatchResult> {
  if (!hasCompletePreviews(batch.venueIds, previews)) throw new Error('Every email must be previewed before approval.');
  const fingerprints = await Promise.all(previews.map(preview => fingerprintDraft(preview)));
  await outreachApi.approveDrafts(token, batch, fingerprints);
  const { dispatchId } = await outreachApi.preflightBatch(token, batch);
  let remaining = batch.venueIds.length;
  const total: IbatchResult = { requested: remaining, sent: 0, skipped: [], records: [], remaining };
  while (remaining > 0) {
    // Only a checked dispatch id chooses venues on this path. Never retry a failed call.
    // eslint-disable-next-line no-await-in-loop
    const chunk = await outreachApi.sendBatch(token, { dispatchId });
    if (!chunk || !Number.isSafeInteger(chunk.sent) || chunk.sent < 0 || !Number.isSafeInteger(chunk.remaining)
      || chunk.remaining < 0 || chunk.remaining > remaining || !Array.isArray(chunk.skipped) || !Array.isArray(chunk.records)
      || chunk.skipped.some(item => !item || typeof item.venueId !== 'string'
        || typeof item.venueName !== 'string' || typeof item.reason !== 'string')
      || chunk.sent + chunk.skipped.length > remaining) {
      throw new Error('The send returned an invalid result. Dispatch stopped; check the outreach records before retrying.');
    }
    total.sent += chunk.sent;
    total.skipped.push(...chunk.skipped);
    total.records.push(...chunk.records);
    total.remaining = chunk.remaining;
    onProgress({ ...total, skipped: [...total.skipped], records: [...total.records] });
    if (chunk.stopped) throw new Error(`Dispatch paused: ${chunk.stopped.venueName}: ${chunk.stopped.reason}`);
    if (chunk.remaining >= remaining) throw new Error('Dispatch made no progress. Check the outreach records before retrying.');
    remaining = chunk.remaining;
  }
  return total;
}

async function getPendingReplies(token: string): Promise<IpendingReply[]> {
  const res = await customFetch(`${outreachUrl}/replies/pending`, { headers: headers(token) });
  if (!res.ok) throw await responseError(res);
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
  if (!res.ok) throw await responseError(res);
  return await res.json();
}

async function recordOutcome(
  token: string,
  id: string,
  payload: {
    status: 'interested' | 'not-interested' | 'booked' | 'target-filled';
    bookedDate?: string;
    targetWeekend?: { start: string; end: string };
  },
): Promise<unknown> {
  const res = await customFetch(`${outreachUrl}/${id}/outcome`, {
    method: 'POST', headers: headers(token, true), body: JSON.stringify(payload),
  });
  if (!res.ok) throw await responseError(res);
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
  if (!res.ok) throw await responseError(res);
  return await res.json() as IpendingReply[];
}

async function deleteOutreach(token: string, id: string): Promise<void> {
  const res = await customFetch(`${outreachUrl}/${id}`, { method: 'DELETE', headers: headers(token) });
  if (!res.ok) throw await responseError(res);
}

// GET /outreach/report — administrator-only index of stored run reports
// (web-jam-back#1084, D-52/D-53). Reading the index requires the admin
// token; the report pages themselves are public and are linked directly
// by the caller, never fetched through this helper.
async function getReportIndex(token: string): Promise<IreportSummary[]> {
  const res = await customFetch(`${outreachUrl}/report`, { headers: headers(token) });
  if (!res.ok) throw await responseError(res);
  return await res.json() as IreportSummary[];
}

const outreachApi = {
  getCandidates,
  sendBatch,
  getVenueApproval,
  approveVenues,
  approveDrafts,
  preflightBatch,
  getPreview,
  getAllowedAdminRoles,
  getPendingReplies,
  applySuggestion,
  deleteOutreach,
  recordOutcome,
  listOutreach,
  getReportIndex,
};

export default outreachApi;
