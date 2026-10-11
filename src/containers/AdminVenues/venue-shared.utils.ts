import type { Ivenue } from './admin-venues.utils';

export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AS', name: 'American Samoa' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'District of Columbia' },
  { code: 'FM', name: 'Federated States of Micronesia' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'GU', name: 'Guam' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'MP', name: 'Northern Mariana Islands' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PW', name: 'Palau' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VI', name: 'Virgin Island' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
] as const;

export const COUNTRIES = [
  { code: 'US', name: 'United States (US)' },
  { code: 'CA', name: 'Canada (CA)' },
  { code: 'GB', name: 'United Kingdom (GB)' },
  { code: 'IE', name: 'Ireland (IE)' },
  { code: 'AU', name: 'Australia (AU)' },
  { code: 'NZ', name: 'New Zealand (NZ)' },
  { code: 'DE', name: 'Germany (DE)' },
  { code: 'FR', name: 'France (FR)' },
  { code: 'IT', name: 'Italy (IT)' },
  { code: 'ES', name: 'Spain (ES)' },
  { code: 'NL', name: 'Netherlands (NL)' },
  { code: 'BE', name: 'Belgium (BE)' },
  { code: 'CH', name: 'Switzerland (CH)' },
  { code: 'AT', name: 'Austria (AT)' },
  { code: 'SE', name: 'Sweden (SE)' },
  { code: 'NO', name: 'Norway (NO)' },
  { code: 'DK', name: 'Denmark (DK)' },
  { code: 'FI', name: 'Finland (FI)' },
  { code: 'JP', name: 'Japan (JP)' },
  { code: 'MX', name: 'Mexico (MX)' },
  { code: 'BR', name: 'Brazil (BR)' },
  { code: 'ZA', name: 'South Africa (ZA)' },
] as const;

export type UsStateCode = (typeof US_STATES)[number]['code'];
export type CountryCode = (typeof COUNTRIES)[number]['code'];

export interface VenueFormFields {
  name?: string;
  address?: string;
  city?: string;
  usState?: string;
  zipCode?: string;
  country?: string;
  website?: string;
  [key: string]: unknown;
}

export interface VenueValidationOptions {
  mode: 'create' | 'edit';
  originalVenue?: Ivenue | null;
}

export interface VenueValidationResult {
  valid: boolean;
  error?: string;
  errors: Record<string, string>;
  formattedWebsite?: string;
}

export function validateZipCode(zip?: string): boolean {
  if (!zip) return false;
  return /^\d{5}(?:-\d{4})?$/.test(zip.trim());
}

export function normalizeWebsiteUrl(website?: string): { valid: boolean; url: string; error?: string } {
  const trimmed = website ? website.trim() : '';
  if (!trimmed) {
    return { valid: true, url: '' };
  }
  let url = trimmed;
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('.') || !['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, url: '', error: 'A valid website URL is required' };
    }
    return { valid: true, url };
  } catch {
    return { valid: false, url: '', error: 'A valid website URL is required' };
  }
}

export function validateVenueFields(
  fields: VenueFormFields,
  options: VenueValidationOptions,
): VenueValidationResult {
  const errors: Record<string, string> = {};
  const isCreate = options.mode === 'create';
  const original = options.originalVenue;

  // 1. Name: required on create and edit; whitespace alone rejected
  const nameTrimmed = (fields.name || '').trim();
  if (!nameTrimmed) {
    errors.name = 'Name is required';
  }

  // 2. Address: required on create; in edit mode, cannot remove existing address
  const hadAddress = Boolean(original && original.address && original.address.trim());
  const addressTrimmed = (fields.address || '').trim();
  if (isCreate && !addressTrimmed) {
    errors.address = 'Street address is required';
  } else if (!isCreate && hadAddress && !addressTrimmed) {
    errors.address = "Address can't be removed — enter the corrected address";
  }

  // 3. City: required on create; in edit mode, cannot remove existing city
  const hadCity = Boolean(original && original.city && original.city.trim());
  const cityTrimmed = (fields.city || '').trim();
  if (isCreate && !cityTrimmed) {
    errors.city = 'City is required';
  } else if (!isCreate && hadCity && !cityTrimmed) {
    errors.city = "City can't be removed — enter the corrected city";
  }

  // 4. Zip Code: required on create; in edit mode, cannot remove existing zip; format check
  const hadZip = Boolean(original && original.zipCode && original.zipCode.trim());
  const zipTrimmed = (fields.zipCode || '').trim();
  if (isCreate && !zipTrimmed) {
    errors.zipCode = 'Zip code is required';
  } else if (!isCreate && hadZip && !zipTrimmed) {
    errors.zipCode = "Zip code can't be removed — enter the corrected zip code";
  } else if (zipTrimmed && !validateZipCode(zipTrimmed)) {
    errors.zipCode = 'Zip code must be a valid 5-digit ZIP code';
  }

  // 5. State: required for US venues (default country is US)
  const currentCountry = (fields.country || 'US').trim();
  const stateTrimmed = (fields.usState || '').trim();
  if (currentCountry === 'US' && !stateTrimmed) {
    errors.usState = 'State is required for US venues';
  }

  // 6. Website: optional; if entered, check URL format and normalize
  let formattedWebsite = '';
  if (fields.website !== undefined) {
    const webRes = normalizeWebsiteUrl(fields.website);
    if (!webRes.valid) {
      errors.website = webRes.error || 'A valid website URL is required';
    } else {
      formattedWebsite = webRes.url;
    }
  }

  const firstError = errors.name
    || errors.address
    || errors.city
    || errors.zipCode
    || errors.usState
    || errors.website;

  return {
    valid: Object.keys(errors).length === 0,
    error: firstError,
    errors,
    formattedWebsite,
  };
}

export const BACKEND_SAVE_RULES = {
  sameAddressRule: 'Same name, city and normalized street address: Update that venue with the submitted fields and make it active',
  differentCityRule: 'Same name but a different city: Create a separate venue',
  differentAddressRule: 'Same name and city, with different non-empty street addresses and no address-less fallback: '
    + 'Create another location',
  singleAddresslessRule: 'One same-name-and-city record without an address, and no street-address match: '
    + 'Update that older record with the submitted address and make it active',
  multipleAddresslessRule: 'Several same-name-and-city records without addresses, and no street-address match: '
    + 'Refuse to guess; show the backend\'s error',
} as const;

export interface ExistingVenueWarningParams {
  name?: string;
  city?: string;
  address?: string;
  inventory: Ivenue[];
  mode: 'create' | 'edit';
  selectedVenueId?: string;
}

export interface ExistingVenueWarning {
  hasWarning: boolean;
  mode: 'create' | 'edit';
  matchingVenues: Ivenue[];
  message: string;
  matchedAddresses: string[];
  hasArchivedMatch: boolean;
  addresslessCount: number;
  sameCityMatches: Ivenue[];
  differentCityMatches: Ivenue[];
  rulesExplanation: typeof BACKEND_SAVE_RULES;
}

export function getExistingVenueWarning(params: ExistingVenueWarningParams): ExistingVenueWarning {
  if (!params.inventory || !Array.isArray(params.inventory)) {
    throw new Error('Venue inventory is required to check for existing venues');
  }

  const emptyResult: ExistingVenueWarning = {
    hasWarning: false,
    mode: params.mode,
    matchingVenues: [],
    message: '',
    matchedAddresses: [],
    hasArchivedMatch: false,
    addresslessCount: 0,
    sameCityMatches: [],
    differentCityMatches: [],
    rulesExplanation: BACKEND_SAVE_RULES,
  };

  const trimmedName = (params.name || '').trim().toLowerCase();
  if (!trimmedName) {
    return emptyResult;
  }

  const trimmedCity = (params.city || '').trim().toLowerCase();

  const matchingVenues = params.inventory.filter((v) => {
    if (params.mode === 'edit' && params.selectedVenueId && v._id === params.selectedVenueId) {
      return false;
    }
    const venueName = (v.name || '').trim().toLowerCase();
    return venueName === trimmedName;
  });

  if (matchingVenues.length === 0) {
    return emptyResult;
  }

  const sameCityMatches = matchingVenues.filter((v) => {
    const vCity = (v.city || '').trim().toLowerCase();
    return trimmedCity ? vCity === trimmedCity : false;
  });

  const differentCityMatches = matchingVenues.filter((v) => {
    const vCity = (v.city || '').trim().toLowerCase();
    return trimmedCity && vCity ? vCity !== trimmedCity : false;
  });

  const matchedAddresses: string[] = [];
  for (const v of matchingVenues) {
    const addr = (v.address || '').trim();
    if (addr && !matchedAddresses.includes(addr)) {
      matchedAddresses.push(addr);
    }
  }

  const hasArchivedMatch = matchingVenues.some((v) => v.status === 'archived');
  const addresslessCount = matchingVenues.filter((v) => !(v.address || '').trim()).length;
  const sameCityAddresslessCount = sameCityMatches.filter((v) => !(v.address || '').trim()).length;

  let message = '';
  const nameStr = (params.name || '').trim();

  if (params.mode === 'edit') {
    const addrList = matchedAddresses.length > 0
      ? `address: ${matchedAddresses.join(', ')}`
      : 'no address on file';
    message = `A venue with the name "${nameStr}" already exists (${addrList}). `
      + 'Saving will edit the selected record (via PATCH). It will not create another record or restore another match.';
  } else {
    // Mode === 'create'
    const intro = `A venue with the name "${nameStr}" already exists.`;
    const venueLines = matchingVenues.map((v) => {
      const vCity = (v.city || '').trim() || 'unspecified city';
      const vAddr = (v.address || '').trim() || 'no address on file';
      const archivedTag = v.status === 'archived' ? ' [archived]' : '';
      return `• "${v.name}" in ${vCity} (${vAddr})${archivedTag}`;
    });

    const notes: string[] = [];
    if (hasArchivedMatch) {
      notes.push('An archived matching record was found. If matched upon save, it will be restored and made active.');
    }
    if (differentCityMatches.length > 0) {
      notes.push('Matching venue(s) in a different city will result in creating a separate venue.');
    }
    if (sameCityMatches.length > 0) {
      if (sameCityAddresslessCount === 1) {
        notes.push(
          'One same-name-and-city record has no address on file. '
          + 'If no street address matches, saving will update that older record and make it active.',
        );
      } else if (sameCityAddresslessCount > 1) {
        notes.push(
          'Several same-name-and-city records have no address on file. '
          + 'If no street address matches, the backend will refuse to guess and return an error.',
        );
      }
    }

    const rulesSection = [
      'Backend save rules:',
      `- ${BACKEND_SAVE_RULES.sameAddressRule}`,
      `- ${BACKEND_SAVE_RULES.differentCityRule}`,
      `- ${BACKEND_SAVE_RULES.differentAddressRule}`,
      `- ${BACKEND_SAVE_RULES.singleAddresslessRule}`,
      `- ${BACKEND_SAVE_RULES.multipleAddresslessRule}`,
    ].join('\n');

    message = [
      intro,
      ...venueLines,
      ...(notes.length > 0 ? ['', ...notes] : []),
      '',
      rulesSection,
    ].join('\n');
  }

  return {
    hasWarning: true,
    mode: params.mode,
    matchingVenues,
    message,
    matchedAddresses,
    hasArchivedMatch,
    addresslessCount,
    sameCityMatches,
    differentCityMatches,
    rulesExplanation: BACKEND_SAVE_RULES,
  };
}

export function formatVenueSaveOutcomeMessage(
  outcome: 'created' | 'updated' | { outcome: 'created' | 'updated'; wasArchived?: boolean },
  wasArchived?: boolean,
): string {
  const kind = typeof outcome === 'string' ? outcome : outcome.outcome;
  const isArchived = typeof outcome === 'object' && outcome.wasArchived !== undefined
    ? outcome.wasArchived
    : Boolean(wasArchived);

  if (kind === 'created') {
    return 'Venue created';
  }
  if (isArchived) {
    return 'Existing archived venue restored and updated';
  }
  return 'Existing venue updated';
}
