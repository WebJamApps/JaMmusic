import {
  formatInVenueTimeZone, formatVenueDateYMD, resolveStateTimeZone, resolveVenueTimeZone,
} from 'src/lib/venueTimezone';

describe('venueTimezone', () => {
  describe('resolveStateTimeZone', () => {
    it('resolves a full state name', () => {
      expect(resolveStateTimeZone('California')).toBe('America/Los_Angeles');
    });
    it('resolves a full state name case-insensitively', () => {
      expect(resolveStateTimeZone('virginia')).toBe('America/New_York');
    });
    it('resolves a 2-letter postal code', () => {
      expect(resolveStateTimeZone('NC')).toBe('America/New_York');
    });
    it('resolves a lowercase 2-letter postal code', () => {
      expect(resolveStateTimeZone('tn')).toBe('America/Chicago');
    });
    it('returns undefined for missing/blank/unknown input', () => {
      expect(resolveStateTimeZone(undefined)).toBeUndefined();
      expect(resolveStateTimeZone('')).toBeUndefined();
      expect(resolveStateTimeZone('  ')).toBeUndefined();
      expect(resolveStateTimeZone('Narnia')).toBeUndefined();
    });
  });

  describe('resolveVenueTimeZone', () => {
    it('prefers the gig usState over the venue usState', () => {
      expect(resolveVenueTimeZone('CA', 'NC')).toBe('America/Los_Angeles');
    });
    it('falls back to the venue usState when the gig has none', () => {
      expect(resolveVenueTimeZone(undefined, 'NC')).toBe('America/New_York');
    });
    it('returns undefined when neither is known', () => {
      expect(resolveVenueTimeZone(undefined, undefined)).toBeUndefined();
    });
  });

  describe('formatVenueDateYMD', () => {
    // Regression case (#1222): Dirty Bull's gig is stored as a UTC instant
    // that rolls to the next UTC day for an Eastern-evening show. Slicing
    // the raw ISO string (the old behavior) showed 11-15; venue-local
    // (NC -> America/New_York) must show 11-14.
    it('shows the venue-local date for a UTC instant that crosses midnight UTC', () => {
      expect(formatVenueDateYMD('2026-11-15T00:00:00Z', undefined, 'NC')).toBe('2026-11-14');
    });
    it('prefers the gig usState over the venue usState', () => {
      expect(formatVenueDateYMD('2026-11-15T00:00:00Z', 'CA', 'NC')).toBe('2026-11-14');
    });
    it('accepts a Date instance', () => {
      expect(formatVenueDateYMD(new Date('2026-11-15T00:00:00Z'), undefined, 'NC')).toBe('2026-11-14');
    });
    it('falls back to the browser/test-runner local zone (UTC) when no usState is known', () => {
      expect(formatVenueDateYMD('2026-07-01T19:00:00.000Z')).toBe('2026-07-01');
    });
  });

  describe('formatInVenueTimeZone', () => {
    it('formats using venue-local time with arbitrary Intl options', () => {
      const result = formatInVenueTimeZone('2026-11-15T00:00:00Z', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      }, undefined, 'NC');
      expect(result).toBe('Saturday, November 14, 2026');
    });
    it('formats time-of-day in venue-local time', () => {
      const result = formatInVenueTimeZone('2026-11-15T00:00:00Z', {
        hour: 'numeric', minute: '2-digit',
      }, undefined, 'NC');
      expect(result).toBe('7:00 PM');
    });
    it('falls back to the runner local zone (UTC) with no usState', () => {
      const result = formatInVenueTimeZone('2026-11-15T00:00:00Z', {
        hour: 'numeric', minute: '2-digit',
      });
      expect(result).toBe('12:00 AM');
    });
  });
});
