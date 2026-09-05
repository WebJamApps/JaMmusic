import { getAllowedAdminRoles } from '../AdminUsers/admin-users.utils';
import ExcelJS from 'exceljs';
import { customFetch } from 'src/lib/fetch.utils';

// Booking-outreach venue + batch-approval admin API (web-jam-back #819/#843/#844).
// Mirrors admin-users.utils: fetch + Bearer token against ${BackendUrl}.

export interface Ivenue {
  _id: string;
  name: string;
  address?: string;
  city?: string;
  usState?: string;
  zipCode?: string;
  country?: string;
  region?: string;
  venueType?: string;
  contactName?: string;
  email?: string;
  secondaryEmail?: string;
  phone?: string;
  website?: string;
  status?: string;
  outreachEligible?: boolean;
  inScope?: boolean;
  bookingStatus?: string;
  notes?: string;
  templateOverride?: string;
  lastContacted?: string;
  lastVerified?: string;
  lastGig?: { datetime?: string; city?: string; usState?: string; [key: string]: unknown } | null;
  nextGig?: { datetime?: string; city?: string; usState?: string; [key: string]: unknown } | null;
  locationFallback?: { city?: string; usState?: string } | null;
  // Prospect-ranking inputs (WebJamApps/JaMmusic#1332): payAmount, audienceAttention,
  // personalFavorite, familyNearby, and distanceKm (attached by backend).
  payAmount?: number;
  audienceAttention?: 'low' | 'medium' | 'high' | string;
  personalFavorite?: boolean;
  familyNearby?: boolean;
  distanceKm?: number | null;
  distance?: number | null;
  gigInterval?: number;
  resumeBooking?: string | null;
}

export interface IvenueUpdate {
  name?: string;
  address?: string;
  city?: string;
  usState?: string;
  zipCode?: string;
  country?: string;
  region?: string;
  venueType?: string;
  contactName?: string;
  email?: string;
  secondaryEmail?: string;
  phone?: string;
  website?: string;
  outreachEligible?: boolean;
  inScope?: boolean;
  bookingStatus?: string;
  notes?: string;
  templateOverride?: string;
  payAmount?: number;
  audienceAttention?: 'low' | 'medium' | 'high' | string;
  personalFavorite?: boolean;
  familyNearby?: boolean;
  status?: string;
  lastContacted?: string;
  lastVerified?: string;
  gigInterval?: number;
  resumeBooking?: string | null;
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
  const res = await customFetch(`${venueUrl}${qs}`, { headers: headers(token) });
  if (!res.ok) await handleResponseError(res);
  return await res.json() as Ivenue[];
}

// Soft-delete a venue (web-jam-back DELETE /venue/:id = archive, recoverable —
// it just drops out of the default list). No hard purge: archiving is enough to
// clear junk entries out of the way (#1139).
async function deleteVenue(token: string, venueId: string): Promise<void> {
  const res = await customFetch(`${venueUrl}/${venueId}`, { method: 'DELETE', headers: headers(token) });
  if (!res.ok) await handleResponseError(res);
}

async function updateVenue(token: string, venueId: string, payload: IvenueUpdate): Promise<Ivenue> {
  const res = await customFetch(`${venueUrl}/${venueId}`, {
    method: 'PATCH', headers: headers(token, true), body: JSON.stringify(payload),
  });
  if (!res.ok) await handleResponseError(res);
  return await res.json() as Ivenue;
}

async function createVenue(token: string, payload: IvenueUpdate): Promise<Ivenue> {
  const res = await customFetch(venueUrl, {
    method: 'POST', headers: headers(token, true), body: JSON.stringify(payload),
  });
  if (!res.ok) await handleResponseError(res);
  return await res.json() as Ivenue;
}

export const VENUE_TYPES = ['Originals', 'PubFestivalBrewery', 'MidRangeCafeBar'] as const;
export const BOOKING_STATUSES = ['booking', 'not-booking', 'booked'] as const;
export const AUDIENCE_ATTENTIONS = ['low', 'medium', 'high'] as const;

// Per-field help written as the automation CONSEQUENCE of the value (#1139 §4),
// not just a definition — shown in column-header tooltips AND inline in the Edit
// dialog so a manual edit can't quietly make the data worse.
export const FIELD_HELP: Record<string, string> = {
  venueType: 'Picks which pitch template is sent (Originals listening-room / Café-Bar / Pub-Festival-Brewery). '
    + 'Blank = can\'t be pitched — no template to choose.',
  inScope: 'Is this a realistic fit for outreach at all? OFF = excluded from outreach entirely.',
  bookingStatus: 'booking = open prospect (will be pitched if Eligible) · booked = confirmed gig (won\'t be pitched) · '
    + 'not-booking = ruled out. "Booked" includes one-off engagements like an anthem.',
  outreachEligible: 'MASTER SAFETY GATE. ON = the auto-cron + batch MAY send a pitch email here. OFF = never emailed, period. '
    + 'Only turn ON once vetted: in scope + has a Type + still booking + contact verified.',
  payAmount: 'Dollar amount typically paid per gig. Ranks better-paying venues higher in the Prospect sort '
    + '(proportional share of $150, capped at +6 points). No send effect.',
  audienceAttention: 'Room listening level: high (+6) = audience is there for the music; medium (+3) = mixed listening/social; '
    + 'low/unset (0) = background music. Carries equal top weight with pay in the Prospect sort.',
  personalFavorite: 'Josh & Maria like going here as patrons (+2 points in Prospect sort). Breaks ties between venues that are otherwise matched.',
  familyNearby: 'Auto-derived from venue address: true (+3 points in Prospect sort) if within 20 miles of family anchor cities '
    + '(Salem, Roanoke, Martinsville, Lynchburg, Gastonia, Rock Hill, Harrisonburg). Exactly offsets the max 3-point distance penalty.',
  lastVerified: 'The date this venue\'s details or contact info were last verified.',
  templateOverride: 'Force a specific template regardless of Type. Leave blank normally.',
  gigInterval: 'Minimum gap between gigs at this venue in months (default 0). '
    + 'Ensures outreach is paused if a gig is already scheduled too close to the target window.',
  resumeBooking: 'Cooldown date: outreach is paused/cooldown is active until this date passes (null/unset = no cooldown).',
};

// Prospect Score (WebJamApps/JaMmusic#1332, book-gig Phase 2 §11) — how worth-pitching-now
// a venue is. Higher = better. Default table sort is eligible-first, then this score desc.
// Sum of:
// - audienceAttention: high (6), medium (3), low or unrated (0)
// - payAmount: share of fixed reference $150 capped at 6
// - familyNearby: 3 flat (offsets max distance penalty)
// - personalFavorite: 2 flat (breaks ties)
// - distance: subtracts up to 3 as share of 100 km
// Floored at 0 and rounded to 1 decimal place.
export function prospectScore(v: Ivenue): number {
  const attentionKey = (v.audienceAttention || '').toLowerCase();
  const attention = { high: 6, medium: 3, low: 0 }[attentionKey] ?? 0;
  const pay = Math.min(6, (Math.max(0, v.payAmount || 0) / 150) * 6);
  const family = v.familyNearby ? 3 : 0;
  const favorite = v.personalFavorite ? 2 : 0;
  const dist = (v.distanceKm ?? v.distance) || 0;
  const distancePenalty = Math.min(3, (Math.max(0, dist) / 100) * 3);
  const total = attention + pay + family + favorite - distancePenalty;
  return Math.max(0, Math.round(total * 10) / 10);
}

export async function exportVenuesToExcel(venues: Ivenue[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Venues');

  // Define columns with headers and keys
  worksheet.columns = [
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Address', key: 'address', width: 25 },
    { header: 'Contact Name', key: 'contactName', width: 20 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Secondary Email', key: 'secondaryEmail', width: 25 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'City', key: 'city', width: 15 },
    { header: 'State', key: 'usState', width: 10 },
    { header: 'Venue Type', key: 'venueType', width: 20 },
    { header: 'Outreach Eligible', key: 'outreachEligible', width: 18 },
    { header: 'In Scope', key: 'inScope', width: 12 },
    { header: 'Booking Status', key: 'bookingStatus', width: 15 },
    { header: 'Pay Amount', key: 'payAmount', width: 12 },
    { header: 'Audience Attention', key: 'audienceAttention', width: 18 },
    { header: 'Personal Favorite', key: 'personalFavorite', width: 18 },
    { header: 'Family Nearby', key: 'familyNearby', width: 15 },
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
      address: v.address || '',
      contactName: v.contactName || '',
      email: v.email || '',
      secondaryEmail: v.secondaryEmail || '',
      phone: v.phone || '',
      city: v.city || '',
      usState: v.usState || '',
      venueType: v.venueType || '',
      outreachEligible: v.outreachEligible ? 'Yes' : 'No',
      inScope: v.inScope !== false ? 'Yes' : 'No',
      bookingStatus: v.bookingStatus || '',
      payAmount: v.payAmount !== undefined ? v.payAmount : '',
      audienceAttention: v.audienceAttention || '',
      personalFavorite: v.personalFavorite ? 'Yes' : 'No',
      familyNearby: v.familyNearby ? 'Yes' : 'No',
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

    // Apply hyperlink formatting to Secondary Email cell if secondaryEmail exists
    if (v.secondaryEmail && v.secondaryEmail.trim()) {
      const secEmailCell = row.getCell('secondaryEmail');
      const emailStr = v.secondaryEmail.trim();
      if (emailStr.includes('@')) {
        secEmailCell.value = { text: emailStr, hyperlink: `mailto:${emailStr}` };
        secEmailCell.font = { color: { argb: 'FF0563C1' }, underline: true };
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

export function getGoogleMapsUrl(address?: string, city?: string, usState?: string): string {
  const query = [address?.trim(), city?.trim(), usState?.trim()].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export default {
  listVenues, updateVenue, deleteVenue, createVenue, getAllowedAdminRoles, prospectScore, exportVenuesToExcel, getGoogleMapsUrl,
};
