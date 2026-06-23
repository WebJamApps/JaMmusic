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

async function listVenues(token: string): Promise<Ivenue[]> {
  const res = await fetch(venueUrl, { headers: headers(token) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as Ivenue[];
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

export default {
  listVenues, updateVenue, getCandidates, sendBatch, getConfig, setConfig, getAllowedAdminRoles,
};
