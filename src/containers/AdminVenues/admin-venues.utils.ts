import { getAllowedAdminRoles } from '../AdminUsers/admin-users.utils';

// Booking-outreach venue + batch-approval admin API (web-jam-back #819/#843/#844).
// Mirrors admin-users.utils: fetch + Bearer token against ${BackendUrl}.

export interface Ivenue {
  _id: string;
  name: string;
  city?: string;
  usState?: string;
  venueType?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  status?: string;
  outreachEligible?: boolean;
  inScope?: boolean;
  bookingStatus?: string;
  interested?: boolean;
  payTier?: string;
  contactVerified?: boolean;
  notes?: string;
  relationshipStage?: string;
  templateOverride?: string;
  // Prospect-ranking inputs (web-jam-back#867): originalsFit weighs heaviest in
  // the default sort, travelBand discounts distance, priority is a manual 0-5 boost.
  originalsFit?: string;
  travelBand?: string;
  priority?: number;
}

export interface IvenueUpdate {
  name?: string;
  city?: string;
  usState?: string;
  venueType?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  outreachEligible?: boolean;
  inScope?: boolean;
  bookingStatus?: string;
  interested?: boolean;
  payTier?: string;
  contactVerified?: boolean;
  notes?: string;
  relationshipStage?: string;
  templateOverride?: string;
  originalsFit?: string;
  travelBand?: string;
  priority?: number;
}

export interface Icandidate {
  _id: string;
  name: string;
  city?: string;
  venueType?: string;
  email?: string;
}

export interface IbatchSkip { venueId: string; reason: string }
export interface IbatchResult {
  requested: number;
  sent: number;
  skipped: IbatchSkip[];
  records: unknown[];
}

const venueUrl = `${process.env.BackendUrl}/venue`;
const outreachUrl = `${process.env.BackendUrl}/outreach`;

function headers(token: string, json = false): Record<string, string> {
  const h: Record<string, string> = { Accept: 'application/json', Authorization: `Bearer ${token}` };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

// `eligibleFor` (a YYYY-MM-DD date) asks the backend for only venues with no
// conflicting gig within the ±2-month clear window of that target weekend
// (web-jam-back#819's GET /venue?eligibleFor=<date>). Omit it to list everything.
async function listVenues(token: string, eligibleFor?: string): Promise<Ivenue[]> {
  const qs = eligibleFor ? `?eligibleFor=${encodeURIComponent(eligibleFor)}` : '';
  const res = await fetch(`${venueUrl}${qs}`, { headers: headers(token) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as Ivenue[];
}

// Soft-delete a venue (web-jam-back DELETE /venue/:id = archive, recoverable —
// it just drops out of the default list). No hard purge: archiving is enough to
// clear junk entries out of the way (#1139).
async function deleteVenue(token: string, venueId: string): Promise<void> {
  const res = await fetch(`${venueUrl}/${venueId}`, { method: 'DELETE', headers: headers(token) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
}

async function updateVenue(token: string, venueId: string, payload: IvenueUpdate): Promise<Ivenue> {
  const res = await fetch(`${venueUrl}/${venueId}`, {
    method: 'PUT', headers: headers(token, true), body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as Ivenue;
}

async function getCandidates(token: string, targetDates?: string): Promise<Icandidate[]> {
  const qs = targetDates ? `?targetDates=${encodeURIComponent(targetDates)}` : '';
  const res = await fetch(`${outreachUrl}/candidates${qs}`, { headers: headers(token) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as Icandidate[];
}

async function sendBatch(
  token: string,
  payload: { venueIds: string[]; targetDates: string; bookingPeriod?: string },
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

export const VENUE_TYPES = ['Originals', 'PubFestivalBrewery', 'MidRangeCafeBar'] as const;
export const BOOKING_STATUSES = ['booking', 'not-booking', 'booked'] as const;
export const RELATIONSHIP_STAGES = ['cold', 'returning'] as const;
export const ORIGINALS_FITS = ['none', 'some', 'loves'] as const;
export const TRAVEL_BANDS = ['local', 'regional', 'far'] as const;

// Per-field help written as the automation CONSEQUENCE of the value (#1139 §4),
// not just a definition — shown in column-header tooltips AND inline in the Edit
// dialog so a manual edit can't quietly make the data worse.
export const FIELD_HELP: Record<string, string> = {
  venueType: 'Picks which pitch template is sent (Originals listening-room / Café-Bar / Pub-Festival-Brewery). '
    + 'Blank = can\'t be pitched — no template to choose.',
  inScope: 'Is this a realistic fit for outreach at all? OFF = excluded from outreach entirely.',
  bookingStatus: 'booking = open prospect (will be pitched if Eligible) · booked = confirmed gig (won\'t be pitched) · '
    + 'not-booking = ruled out. "Booked" includes one-off engagements like an anthem.',
  interested: 'Marks a warm lead — sorts higher and nudges the warm/"returning" template.',
  outreachEligible: 'MASTER SAFETY GATE. ON = the auto-cron + batch MAY send a pitch email here. OFF = never emailed, period. '
    + 'Only turn ON once vetted: in scope + has a Type + still booking + contact verified.',
  payTier: 'Relative pay (e.g. $/$$/$$$); ranks better-paying venues higher in the default sort. No send effect.',
  contactVerified: 'Is the email/contact confirmed good? Should be true before Eligible.',
  relationshipStage: 'cold (never played) vs returning (played before) — picks the cold vs warm template. Auto = inferred from history.',
  templateOverride: 'Force a specific template regardless of Type. Leave blank normally.',
  originalsFit: 'How much the venue welcomes ORIGINAL music — the heaviest factor in the default Prospect sort (loves > some > none).',
  travelBand: 'Coarse distance from Salem, VA. Farther venues are discounted in the Prospect sort (local > regional > far).',
  priority: 'Manual 0–5 boost to nudge a venue up or down the default Prospect sort, regardless of the other factors.',
};

// Map a free-text pay note to a 0–3 value for the Prospect Score: count the
// `$` signs (capped at 3). Anything without `$` scores 0.
function payTierValue(payTier?: string): number {
  if (!payTier) return 0;
  return Math.min(3, (payTier.match(/\$/g) || []).length);
}

// Prospect Score (#1139, decided 2026-06-26) — how worth-pitching-now a venue
// is. Higher = better. Default table sort is eligible-first, then this score
// desc. Originals-fit dominates; value = pay minus travel distance; warmth and a
// manual priority boost break ties. Pure + transparent (formula shown in a tooltip).
export function prospectScore(v: Ivenue): number {
  const fit = { none: 0, some: 3, loves: 6 }[v.originalsFit || 'none'] ?? 0;
  const travel = { local: 0, regional: 1, far: 2 }[v.travelBand || 'local'] ?? 0;
  const value = payTierValue(v.payTier) - travel;
  const warmth = (v.interested ? 2 : 0) + (v.relationshipStage === 'returning' ? 1 : 0) + (v.contactVerified ? 1 : 0);
  return fit + value + warmth + (v.priority || 0);
}

export default {
  listVenues, updateVenue, deleteVenue, getCandidates, sendBatch, getConfig, setConfig, getAllowedAdminRoles, prospectScore,
};
