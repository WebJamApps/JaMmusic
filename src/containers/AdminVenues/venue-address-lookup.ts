import { useCallback, useEffect, useRef, useState } from 'react';
import { customFetch } from 'src/lib/fetch.utils';
import type { IvenueUpdate } from './admin-venues.utils';

export interface VenueListingSuggestion {
  listingId: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  website: string;
  lat: number;
  lng: number;
}

export function formatListingOption(listing: VenueListingSuggestion): string {
  const locationPart = [listing.street, listing.city].filter(Boolean).join(', ');
  return [listing.name, locationPart].filter(Boolean).join(' — ');
}

async function lookupListings(
  query: string,
  token: string,
  signal: AbortSignal,
): Promise<{ status: number; data: unknown }> {
  const params = new URLSearchParams({ q: query });
  const response = await customFetch(`${process.env.BackendUrl}/venue/listings/search?${params}`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    signal,
  });
  if (!response.ok) {
    return { status: response.status, data: null };
  }
  return { status: response.status, data: await response.json() };
}

export function addressFields(
  listing: Partial<VenueListingSuggestion>,
  current: IvenueUpdate,
): IvenueUpdate {
  const country = current.country || 'US';
  const hasCoords = typeof listing.lat === 'number'
    && Number.isFinite(listing.lat)
    && Math.abs(listing.lat) <= 90
    && typeof listing.lng === 'number'
    && Number.isFinite(listing.lng)
    && Math.abs(listing.lng) <= 180
    && !(listing.lat === 0 && listing.lng === 0);
  const location: IvenueUpdate['location'] = hasCoords
    ? { type: 'Point', coordinates: [listing.lng!, listing.lat!] }
    : undefined;
  const existingWebsite = (current.website || '').trim();
  const zip = listing.zipCode ? listing.zipCode.split('-')[0] : '';
  return {
    ...current,
    name: listing.name || current.name,
    address: listing.street || current.address,
    city: listing.city || current.city,
    country,
    usState: country === 'US' ? listing.state || current.usState : '',
    region: country === 'US' ? '' : listing.state || current.region,
    zipCode: zip || current.zipCode,
    website: existingWebsite ? current.website : (listing.website || current.website || ''),
    location,
  };
}

function isListingSuggestion(value: unknown): value is VenueListingSuggestion {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  if (
    typeof record.listingId !== 'string'
    || typeof record.name !== 'string'
    || typeof record.street !== 'string'
  ) {
    return false;
  }
  const optionalStrings = ['city', 'state', 'zipCode', 'website'] as const;
  const optionalNumbers = ['lat', 'lng'] as const;
  return optionalStrings.every((key) => !Object.hasOwn(record, key) || typeof record[key] === 'string')
    && optionalNumbers.every(
      (key) => !Object.hasOwn(record, key)
        || (typeof record[key] === 'number' && Number.isFinite(record[key])),
    );
}

// All invalidations happen synchronously, before React renders or the debounce expires.
// Even a transport that ignores abort cannot apply an obsolete result.
export function useAddressLookup(
  open: boolean,
  token: string,
  onSelect: (listing: VenueListingSuggestion) => void,
) {
  const [suggestions, setSuggestions] = useState<VenueListingSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const pending = useRef<AbortController | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const revision = useRef(0);
  const selectRef = useRef(onSelect);
  useEffect(() => { selectRef.current = onSelect; }, [onSelect]);

  const cancel = useCallback(() => {
    revision.current += 1;
    clearTimeout(timer.current);
    pending.current?.abort();
  }, []);

  const invalidate = useCallback(() => {
    cancel();
    setSuggestions([]);
    setLoading(false);
    setMessage('');
  }, [cancel]);

  useEffect(() => {
    invalidate();
    return cancel;
  }, [open, token, invalidate, cancel]);

  const search = useCallback((input: string) => {
    invalidate();
    const trimmed = input.trim();
    if (!open || trimmed.length < 2) return;
    const version = revision.current;
    timer.current = setTimeout(async () => {
      const controller = new AbortController();
      pending.current = controller;
      setLoading(true);
      try {
        const { status, data } = await lookupListings(trimmed, token, controller.signal);
        if (version !== revision.current) return;
        if (status === 503) {
          setMessage('Venue listings have not loaded yet. You can enter the venue details manually.');
          return;
        }
        if (status < 200 || status >= 300 || !Array.isArray(data) || !data.every(isListingSuggestion)) {
          setMessage('Address lookup unavailable. You can enter the venue details manually.');
          return;
        }
        setSuggestions(data);
        if (data.length === 0) {
          setMessage('No matching venues found. You can enter the venue details manually.');
        }
      } catch {
        if (version === revision.current) {
          setMessage('Address lookup unavailable. You can enter the venue details manually.');
        }
      } finally {
        if (version === revision.current) setLoading(false);
      }
    }, 300);
  }, [open, token, invalidate]);

  const select = useCallback((listing: VenueListingSuggestion) => {
    invalidate();
    if (!open) return;
    selectRef.current(listing);
  }, [open, invalidate]);

  return { suggestions, loading, message, search, select, invalidate };
}
