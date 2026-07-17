// Shared venue-timezone date formatting (#1222).
//
// Gig `datetime` is stored as a UTC instant. Formatting it against the
// *browser's* local timezone (the old behavior) or by naively slicing the
// ISO string (also the old behavior) both render the wrong calendar date
// whenever the gig's venue isn't in the same zone as whoever's looking —
// e.g. an Eastern-evening gig stored as `...T00:00Z` the next day. The fix:
// resolve the venue's US state to an IANA timezone and format through
// `Intl` (DST-aware for free), falling back to the browser's local zone
// when no state is known.

// Dominant IANA timezone per US state/territory (matches the full-name list
// used by src/containers/Music/Gigs/gigs.utils.tsx `usStateOptions`). Split-
// timezone states use their most-populous zone (e.g. Tennessee -> Chicago,
// Michigan -> Detroit/Eastern).
export const US_STATE_TIMEZONES: Record<string, string> = {
  Alabama: 'America/Chicago',
  Alaska: 'America/Anchorage',
  'American Samoa': 'Pacific/Pago_Pago',
  Arizona: 'America/Phoenix',
  Arkansas: 'America/Chicago',
  California: 'America/Los_Angeles',
  Colorado: 'America/Denver',
  Connecticut: 'America/New_York',
  Delaware: 'America/New_York',
  'District of Columbia': 'America/New_York',
  'Federated States of Micronesia': 'Pacific/Pohnpei',
  Florida: 'America/New_York',
  Georgia: 'America/New_York',
  Guam: 'Pacific/Guam',
  Hawaii: 'Pacific/Honolulu',
  Idaho: 'America/Boise',
  Illinois: 'America/Chicago',
  Indiana: 'America/Indiana/Indianapolis',
  Iowa: 'America/Chicago',
  Kansas: 'America/Chicago',
  Kentucky: 'America/New_York',
  Louisiana: 'America/Chicago',
  Maine: 'America/New_York',
  'Marshall Islands': 'Pacific/Majuro',
  Maryland: 'America/New_York',
  Massachusetts: 'America/New_York',
  Michigan: 'America/Detroit',
  Minnesota: 'America/Chicago',
  Mississippi: 'America/Chicago',
  Missouri: 'America/Chicago',
  Montana: 'America/Denver',
  Nebraska: 'America/Chicago',
  Nevada: 'America/Los_Angeles',
  'New Hampshire': 'America/New_York',
  'New Jersey': 'America/New_York',
  'New Mexico': 'America/Denver',
  'New York': 'America/New_York',
  'North Carolina': 'America/New_York',
  'North Dakota': 'America/Chicago',
  'Northern Mariana Islands': 'Pacific/Saipan',
  Ohio: 'America/New_York',
  Oklahoma: 'America/Chicago',
  Oregon: 'America/Los_Angeles',
  Palau: 'Pacific/Palau',
  Pennsylvania: 'America/New_York',
  'Puerto Rico': 'America/Puerto_Rico',
  'Rhode Island': 'America/New_York',
  'South Carolina': 'America/New_York',
  'South Dakota': 'America/Chicago',
  Tennessee: 'America/Chicago',
  Texas: 'America/Chicago',
  Utah: 'America/Denver',
  Vermont: 'America/New_York',
  'Virgin Island': 'America/St_Thomas',
  Virginia: 'America/New_York',
  Washington: 'America/Los_Angeles',
  'West Virginia': 'America/New_York',
  Wisconsin: 'America/Chicago',
  Wyoming: 'America/Denver',
};

// Two-letter postal codes -> full state name, so callers that store the
// abbreviated form (e.g. the Venues admin UI: usState: 'NC') resolve too.
const US_STATE_ABBR_TO_NAME: Record<string, string> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AS: 'American Samoa',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  DC: 'District of Columbia',
  FM: 'Federated States of Micronesia',
  FL: 'Florida',
  GA: 'Georgia',
  GU: 'Guam',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MH: 'Marshall Islands',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  MP: 'Northern Mariana Islands',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PW: 'Palau',
  PA: 'Pennsylvania',
  PR: 'Puerto Rico',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VI: 'Virgin Island',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};

const US_STATE_TIMEZONES_LOWER: Record<string, string> = Object.fromEntries(
  Object.entries(US_STATE_TIMEZONES).map(([name, tz]) => [name.toLowerCase(), tz]),
);

// Resolve a single `usState` value (full name like "Virginia" or 2-letter
// postal code like "VA") to its IANA timezone. Returns undefined when
// `usState` is missing/blank/unrecognized.
export function resolveStateTimeZone(usState?: string): string | undefined {
  if (!usState) return undefined;
  const trimmed = usState.trim();
  if (!trimmed) return undefined;
  if (trimmed.length === 2) {
    const fullName = US_STATE_ABBR_TO_NAME[trimmed.toUpperCase()];
    if (fullName) return US_STATE_TIMEZONES[fullName];
  }
  return US_STATE_TIMEZONES_LOWER[trimmed.toLowerCase()];
}

// Fallback chain (#1222 approved design): the gig's own usState, else the
// venue's usState, else undefined (caller omits `timeZone` and Intl falls
// back to the browser's local zone — the pre-fix Gigs UI behavior).
export function resolveVenueTimeZone(gigUsState?: string, venueUsState?: string): string | undefined {
  return resolveStateTimeZone(gigUsState) || resolveStateTimeZone(venueUsState);
}

// General-purpose formatter: same as `new Date(dt).toLocaleString('en-US', options)`,
// but resolved to the venue's timezone when known. Used by the Gigs UI so gig
// date/time render in the venue's local time instead of the viewer's browser zone.
export function formatInVenueTimeZone(
  datetime: string | Date,
  options: Intl.DateTimeFormatOptions,
  gigUsState?: string,
  venueUsState?: string,
): string {
  const dt = typeof datetime === 'string' ? new Date(datetime) : datetime;
  const timeZone = resolveVenueTimeZone(gigUsState, venueUsState);
  return dt.toLocaleString('en-US', timeZone ? { ...options, timeZone } : options);
}

// YYYY-MM-DD formatter (the Venues admin table's display format) — 'en-CA'
// locale formats dates as YYYY-MM-DD by default, so this stays Intl-only.
export function formatVenueDateYMD(
  datetime: string | Date,
  gigUsState?: string,
  venueUsState?: string,
): string {
  const dt = typeof datetime === 'string' ? new Date(datetime) : datetime;
  const timeZone = resolveVenueTimeZone(gigUsState, venueUsState);
  const options: Intl.DateTimeFormatOptions = timeZone
    ? { year: 'numeric', month: '2-digit', day: '2-digit', timeZone }
    : { year: 'numeric', month: '2-digit', day: '2-digit' };
  return dt.toLocaleDateString('en-CA', options);
}

export default {
  US_STATE_TIMEZONES,
  resolveStateTimeZone,
  resolveVenueTimeZone,
  formatInVenueTimeZone,
  formatVenueDateYMD,
};
