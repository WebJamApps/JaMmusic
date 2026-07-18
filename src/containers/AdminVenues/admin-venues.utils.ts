import { getAllowedAdminRoles } from '../AdminUsers/admin-users.utils';
import ExcelJS from 'exceljs';

// Booking-outreach venue + batch-approval admin API (web-jam-back #819/#843/#844).
// Mirrors admin-users.utils: fetch + Bearer token against ${BackendUrl}.

export interface Ivenue {
  _id: string;
  name: string;
  city?: string;
  usState?: string;
  country?: string;
  region?: string;
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
  lastContacted?: string;
  lastVerified?: string;
  lastGig?: { datetime?: string; city?: string; usState?: string; [key: string]: unknown } | null;
  nextGig?: { datetime?: string; city?: string; usState?: string; [key: string]: unknown } | null;
  locationFallback?: { city?: string; usState?: string } | null;
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
  country?: string;
  region?: string;
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
  status?: string;
  lastContacted?: string;
  lastVerified?: string;
}

const venueUrl = `${process.env.BackendUrl}/venue`;

function headers(token: string, json = false): Record<string, string> {
  const h: Record<string, string> = { Accept: 'application/json', Authorization: `Bearer ${token}` };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

// `eligibleFor` (a YYYY-MM-DD date) asks the backend for only venues with no
// conflicting gig within the ±2-month clear window of that target weekend
async function handleResponseError(res: Response): Promise<never> {
  let message = `${res.status} ${res.statusText}`;
  try {
    const body = await res.json() as { message?: string };
    if (body && typeof body.message === 'string') {
      message = body.message;
    }
  } catch {
    // ignore JSON parsing failure
  }
  throw new Error(message);
}

// (web-jam-back#819's GET /venue?eligibleFor=<date>). Omit it to list everything.
async function listVenues(token: string, eligibleFor?: string, status?: string): Promise<Ivenue[]> {
  const params = new URLSearchParams();
  if (eligibleFor) params.append('eligibleFor', eligibleFor);
  if (status) params.append('status', status);
  const qs = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${venueUrl}${qs}`, { headers: headers(token) });
  if (!res.ok) await handleResponseError(res);
  return await res.json() as Ivenue[];
}

// Soft-delete a venue (web-jam-back DELETE /venue/:id = archive, recoverable —
// it just drops out of the default list). No hard purge: archiving is enough to
// clear junk entries out of the way (#1139).
async function deleteVenue(token: string, venueId: string): Promise<void> {
  const res = await fetch(`${venueUrl}/${venueId}`, { method: 'DELETE', headers: headers(token) });
  if (!res.ok) await handleResponseError(res);
}

async function updateVenue(token: string, venueId: string, payload: IvenueUpdate): Promise<Ivenue> {
  const res = await fetch(`${venueUrl}/${venueId}`, {
    method: 'PUT', headers: headers(token, true), body: JSON.stringify(payload),
  });
  if (!res.ok) await handleResponseError(res);
  return await res.json() as Ivenue;
}

async function createVenue(token: string, payload: IvenueUpdate): Promise<Ivenue> {
  const res = await fetch(venueUrl, {
    method: 'POST', headers: headers(token, true), body: JSON.stringify(payload),
  });
  if (!res.ok) await handleResponseError(res);
  return await res.json() as Ivenue;
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
  lastVerified: 'The date this venue\'s details or contact info were last verified.',
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

export async function exportVenuesToExcel(venues: Ivenue[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Venues');

  // Define columns with headers and keys
  worksheet.columns = [
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Contact Name', key: 'contactName', width: 20 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'City', key: 'city', width: 15 },
    { header: 'State', key: 'usState', width: 10 },
    { header: 'Venue Type', key: 'venueType', width: 20 },
    { header: 'Outreach Eligible', key: 'outreachEligible', width: 18 },
    { header: 'In Scope', key: 'inScope', width: 12 },
    { header: 'Booking Status', key: 'bookingStatus', width: 15 },
    { header: 'Interested', key: 'interested', width: 12 },
    { header: 'Pay Tier', key: 'payTier', width: 12 },
    { header: 'Contact Verified', key: 'contactVerified', width: 18 },
    { header: 'Originals Fit', key: 'originalsFit', width: 15 },
    { header: 'Travel Band', key: 'travelBand', width: 12 },
    { header: 'Priority', key: 'priority', width: 10 },
    { header: 'Relationship Stage', key: 'relationshipStage', width: 20 },
    { header: 'Template Override', key: 'templateOverride', width: 20 },
    { header: 'Website', key: 'website', width: 30 },
    { header: 'Last Contacted', key: 'lastContacted', width: 18 },
    { header: 'Notes', key: 'notes', width: 40 },
  ];

  // Make header row bold and stylized
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2E7D32' }, // Sleek green header matching WebJam / venue branding
    };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  });
  headerRow.height = 25;

  const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

  venues.forEach((v) => {
    const rowData = {
      name: v.name || '',
      contactName: v.contactName || '',
      email: v.email || '',
      phone: v.phone || '',
      city: v.city || '',
      usState: v.usState || '',
      venueType: v.venueType || '',
      outreachEligible: v.outreachEligible ? 'Yes' : 'No',
      inScope: v.inScope !== false ? 'Yes' : 'No',
      bookingStatus: v.bookingStatus || '',
      interested: v.interested !== false ? 'Yes' : 'No',
      payTier: v.payTier || '',
      contactVerified: v.contactVerified ? 'Yes' : 'No',
      originalsFit: v.originalsFit || '',
      travelBand: v.travelBand || '',
      priority: v.priority !== undefined ? v.priority : '',
      relationshipStage: v.relationshipStage || '',
      templateOverride: v.templateOverride || '',
      website: v.website || '',
      lastContacted: v.lastContacted || '',
      notes: v.notes || '',
    };

    const row = worksheet.addRow(rowData);
    row.height = 20;

    // Apply hyperlink formatting to Email cell if email exists
    if (v.email && v.email.trim()) {
      const emailCell = row.getCell('email');
      const emailStr = v.email.trim();
      if (emailStr.includes('@')) {
        emailCell.value = { text: emailStr, hyperlink: `mailto:${emailStr}` };
        emailCell.font = { color: { argb: 'FF0563C1' }, underline: true };
      }
    }

    // Apply hyperlink formatting to Website cell if website exists
    if (v.website && v.website.trim()) {
      const websiteCell = row.getCell('website');
      const webStr = v.website.trim();
      const url = /^www\./i.test(webStr) ? `https://${webStr}` : webStr;
      websiteCell.value = { text: webStr, hyperlink: url };
      websiteCell.font = { color: { argb: 'FF0563C1' }, underline: true };
    }

    // Apply hyperlink formatting to Notes cell if notes contains a URL
    if (v.notes && v.notes.trim()) {
      const notesCell = row.getCell('notes');
      const notesStr = v.notes.trim();
      const match = notesStr.match(URL_REGEX);
      if (match) {
        const firstUrl = match[0];
        const url = /^www\./i.test(firstUrl) ? `https://${firstUrl}` : firstUrl;
        notesCell.value = { text: notesStr, hyperlink: url };
        notesCell.font = { color: { argb: 'FF0563C1' }, underline: true };
      }
    }
  });

  // Write to a buffer and trigger a file download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'venues_export.xlsx';
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export default {
  listVenues, updateVenue, deleteVenue, createVenue, getAllowedAdminRoles, prospectScore, exportVenuesToExcel,
};
