import type { Igig } from 'src/providers/Data.provider';

export interface CaptionOptions {
  venueWebsite?: string;
  referenceDate?: Date;
}

const SHORT_MONTHS = [
  'Jan', 'Feb', 'March', 'April', 'May', 'June',
  'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec',
];

const US_STATE_ABBREVIATIONS: Record<string, string> = {
  Alabama: 'AL',
  Alaska: 'AK',
  Arizona: 'AZ',
  Arkansas: 'AR',
  California: 'CA',
  Colorado: 'CO',
  Connecticut: 'CT',
  Delaware: 'DE',
  Florida: 'FL',
  Georgia: 'GA',
  Hawaii: 'HI',
  Idaho: 'ID',
  Illinois: 'IL',
  Indiana: 'IN',
  Iowa: 'IA',
  Kansas: 'KS',
  Kentucky: 'KY',
  Louisiana: 'LA',
  Maine: 'ME',
  Maryland: 'MD',
  Massachusetts: 'MA',
  Michigan: 'MI',
  Minnesota: 'MN',
  Mississippi: 'MS',
  Missouri: 'MO',
  Montana: 'MT',
  Nebraska: 'NE',
  Nevada: 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  Ohio: 'OH',
  Oklahoma: 'OK',
  Oregon: 'OR',
  Pennsylvania: 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  Tennessee: 'TN',
  Texas: 'TX',
  Utah: 'UT',
  Vermont: 'VT',
  Virginia: 'VA',
  Washington: 'WA',
  'West Virginia': 'WV',
  Wisconsin: 'WI',
  Wyoming: 'WY',
  'District of Columbia': 'DC',
  'Puerto Rico': 'PR',
};

export function formatStateAbbr(state?: string): string {
  if (!state) return '';
  const trimmed = state.trim();
  if (trimmed.length === 2) return trimmed.toUpperCase();
  return US_STATE_ABBREVIATIONS[trimmed] || trimmed;
}

export function extractVenueInfo(
  gig: Igig,
  venueWebsiteOverride = '',
): { venueName: string; venueWebsite: string } {
  let venueName = '';
  let venueWebsite = venueWebsiteOverride;

  if (gig.venueId && typeof gig.venueId === 'object') {
    venueName = gig.venueId.name || '';
    if (!venueWebsite && gig.venueId.website) {
      venueWebsite = gig.venueId.website;
    }
  }

  if (!venueName && gig.venue) {
    const anchorMatch = gig.venue.match(/<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["'][^>]*>(.*?)<\/a>/i);
    if (anchorMatch) {
      if (!venueWebsite) {
        venueWebsite = anchorMatch[1];
      }
      venueName = anchorMatch[2].replace(/<[^>]*>/g, '').trim();
    } else {
      venueName = gig.venue.replace(/<[^>]*>/g, '').trim();
    }
  }

  return { venueName, venueWebsite };
}

export function extractLocation(gig: Igig): { city: string; state: string } {
  let city = '';
  let state = '';

  if (gig.venueId && typeof gig.venueId === 'object') {
    city = gig.venueId.city || '';
    state = gig.venueId.usState || '';
  }
  if (!city && gig.city) city = gig.city;
  if (!state && gig.usState) state = gig.usState;

  return { city: city.trim(), state: state.trim() };
}

export function formatPlainDate(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: 'numeric',
    day: 'numeric',
  });
  const parts = formatter.formatToParts(date);
  const monthNum = parseInt(parts.find((p) => p.type === 'month')?.value || '1', 10);
  const day = parts.find((p) => p.type === 'day')?.value || '1';
  const monthName = SHORT_MONTHS[monthNum - 1];
  return `${monthName} ${day}`;
}

export function formatWeekdayEastern(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'long',
  }).format(date);
}

export function isWithin7Days(gigDate: Date, refDate: Date = new Date()): boolean {
  const gigTime = gigDate.getTime();
  const refTime = refDate.getTime();
  const diffMs = gigTime - refTime;
  const oneDayMs = 24 * 60 * 60 * 1000;
  const sevenDaysMs = 7 * oneDayMs;
  return diffMs >= -oneDayMs && diffMs <= sevenDaysMs;
}

export function formatTimeRangeEastern(datetime: Date | string, durationHours?: number): string {
  const startDate = typeof datetime === 'string' ? new Date(datetime) : datetime;
  const startParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).formatToParts(startDate);

  const startHour = startParts.find((p) => p.type === 'hour')?.value || '';
  const startMinute = startParts.find((p) => p.type === 'minute')?.value || '00';
  const startDayPeriod = startParts.find((p) => p.type === 'dayPeriod')?.value || 'PM';

  const startFormattedTime = startMinute === '00' ? startHour : `${startHour}:${startMinute}`;

  if (!durationHours || durationHours <= 0) {
    return `${startFormattedTime} ${startDayPeriod}`;
  }

  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);
  const endParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).formatToParts(endDate);

  const endHour = endParts.find((p) => p.type === 'hour')?.value || '';
  const endMinute = endParts.find((p) => p.type === 'minute')?.value || '00';
  const endDayPeriod = endParts.find((p) => p.type === 'dayPeriod')?.value || 'PM';

  const endFormattedTime = endMinute === '00' ? endHour : `${endHour}:${endMinute}`;

  if (startDayPeriod === endDayPeriod) {
    return `${startFormattedTime}–${endFormattedTime} ${endDayPeriod}`;
  }
  return `${startFormattedTime} ${startDayPeriod}–${endFormattedTime} ${endDayPeriod}`;
}

export function generateStartingCaption(gig: Igig, options?: CaptionOptions): string {
  const refDate = options?.referenceDate || new Date();
  const { venueName, venueWebsite } = extractVenueInfo(gig, options?.venueWebsite);
  const { city, state } = extractLocation(gig);
  const stateAbbr = formatStateAbbr(state);
  const locationText = [city, stateAbbr].filter(Boolean).join(', ');

  const gigDate = gig.datetime ? new Date(gig.datetime) : refDate;
  const in7Days = isWithin7Days(gigDate, refDate);
  const plainDate = formatPlainDate(gigDate);
  const weekday = formatWeekdayEastern(gigDate);
  const dateIntro = in7Days ? `this ${weekday}` : plainDate;
  const timeRange = formatTimeRangeEastern(gigDate, gig.duration);

  const locSuffix = locationText ? ` in ${locationText}` : '';
  const gigHeading = `Josh & Maria at ${venueName || 'venue'}${locSuffix}`;
  const introParagraph = `<p>Live music ${dateIntro}! 🎶 ${gigHeading} — ${plainDate}, ${timeRange}. Come grab a pint and hang out with us!</p>`;

  const paragraphs = [introParagraph];

  const strippedTickets = (gig.tickets || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();
  if (strippedTickets) {
    paragraphs.push(`<p>${strippedTickets}</p>`);
  }

  const cleanVenueWebsite = (venueWebsite || '').trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
  if (cleanVenueWebsite) {
    paragraphs.push(`<p>www.joshandmariamusic.com<br />${cleanVenueWebsite}</p>`);
  } else {
    paragraphs.push('<p>www.joshandmariamusic.com</p>');
  }

  const hashtags = ['#livemusic'];
  if (city) {
    const cityTag = city.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cityTag) hashtags.push(`#${cityTag}`);
  }
  if (state) {
    const stateTag = stateAbbr.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (stateTag) hashtags.push(`#${stateTag}`);
  }
  paragraphs.push(`<p>${hashtags.join(' ')}</p>`);

  return paragraphs.join('\n');
}

export default {
  generateStartingCaption,
  extractVenueInfo,
  extractLocation,
  formatPlainDate,
  formatWeekdayEastern,
  formatTimeRangeEastern,
  formatStateAbbr,
  isWithin7Days,
};
