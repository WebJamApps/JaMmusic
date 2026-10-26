import { useCallback, useEffect, useRef, useState } from 'react';
import { customFetch } from 'src/lib/fetch.utils';
import type { IvenueUpdate } from './admin-venues.utils';

export interface AddressSuggestion { placeId: string; text: string }
export interface PlaceAddress {
  formattedAddress?: string; street?: string; city?: string; state?: string;
  country?: string; zipCode?: string; lat?: number; lng?: number;
}

async function lookupRequest(path: string, token: string, signal: AbortSignal): Promise<unknown> {
  const response = await customFetch(`${process.env.BackendUrl}/venue/places/${path}`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }, signal,
  });
  if (!response.ok) throw new Error('Address lookup unavailable');
  return response.json();
}

export function addressFields(place: PlaceAddress, current: IvenueUpdate): IvenueUpdate {
  const country = place.country || current.country || 'US';
  const location: IvenueUpdate['location'] = typeof place.lat === 'number' && Number.isFinite(place.lat)
    && Math.abs(place.lat) <= 90 && typeof place.lng === 'number' && Number.isFinite(place.lng) && Math.abs(place.lng) <= 180
    ? { type: 'Point', coordinates: [place.lng, place.lat] } : undefined;
  return {
    ...current, address: place.street || current.address, city: place.city || current.city,
    country, usState: country === 'US' ? place.state || current.usState : '',
    region: country === 'US' ? '' : place.state || current.region,
    zipCode: place.zipCode?.split('-')[0] || current.zipCode, location,
  };
}

function isSuggestion(value: unknown): value is AddressSuggestion {
  return typeof value === 'object' && value !== null && 'placeId' in value && typeof value.placeId === 'string'
    && 'text' in value && typeof value.text === 'string';
}

function isPlace(value: unknown): value is PlaceAddress {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const fields = ['formattedAddress', 'street', 'city', 'state', 'country', 'zipCode'] as const;
  return fields.every((key) => !Object.hasOwn(value, key) || typeof (value as Record<string, unknown>)[key] === 'string');
}

// All invalidations happen synchronously, before React renders or the debounce expires.
// Even a transport that ignores abort cannot apply an obsolete result.
export function useAddressLookup(open: boolean, token: string, onSelect: (place: PlaceAddress) => void) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const pending = useRef<AbortController | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const revision = useRef(0);
  const session = useRef<string | undefined>(undefined);
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
    session.current = undefined;
    return cancel;
  }, [open, token, invalidate, cancel]);

  const search = useCallback((input: string, regionCode: string) => {
    invalidate();
    if (!open || !input.trim()) return;
    session.current ??= crypto.randomUUID();
    const sessionToken = session.current;
    const version = revision.current;
    timer.current = setTimeout(async () => {
      const controller = new AbortController();
      pending.current = controller;
      setLoading(true);
      try {
        const params = new URLSearchParams({ input, sessionToken, regionCode: regionCode.toLowerCase() });
        const result = await lookupRequest(`suggest?${params}`, token, controller.signal);
        if (version !== revision.current) return;
        if (!Array.isArray(result) || !result.every(isSuggestion)) throw new Error('Invalid suggestions');
        setSuggestions(result);
        if (result.length === 0) setMessage('No address suggestions. You can enter the address manually.');
      } catch {
        if (version === revision.current) setMessage('Address lookup unavailable. You can enter the address manually.');
      } finally {
        if (version === revision.current) setLoading(false);
      }
    }, 300);
  }, [open, token, invalidate]);

  const select = useCallback(async (suggestion: AddressSuggestion) => {
    const sessionToken = session.current;
    invalidate();
    session.current = undefined;
    if (!open || !sessionToken) return;
    const version = revision.current;
    const controller = new AbortController();
    pending.current = controller;
    setLoading(true);
    try {
      const result = await lookupRequest(`${encodeURIComponent(suggestion.placeId)}?${new URLSearchParams({ sessionToken })}`,
        token, controller.signal);
      if (version !== revision.current) return;
      if (!isPlace(result)) throw new Error('Invalid address');
      selectRef.current(result);
    } catch {
      if (version === revision.current) setMessage('Address lookup unavailable. You can enter the address manually.');
    } finally {
      if (version === revision.current) setLoading(false);
    }
  }, [open, token, invalidate]);

  return { suggestions, loading, message, search, select, invalidate };
}
