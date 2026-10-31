import { describe, it, expect } from 'vitest';
import {
  generateStartingCaption,
  extractVenueInfo,
  extractLocation,
  formatPlainDate,
  formatWeekdayEastern,
  formatTimeRangeEastern,
  formatStateAbbr,
  isWithin7Days,
} from 'src/containers/Music/Gigs/caption-generator';
import type { Igig } from 'src/providers/Data.provider';

describe('caption-generator', () => {
  describe('formatStateAbbr', () => {
    it('returns 2-letter uppercase codes directly', () => {
      expect(formatStateAbbr('sc')).toBe('SC');
      expect(formatStateAbbr('VA')).toBe('VA');
    });

    it('maps full US state names to 2-letter postal codes', () => {
      expect(formatStateAbbr('South Carolina')).toBe('SC');
      expect(formatStateAbbr('Virginia')).toBe('VA');
      expect(formatStateAbbr('North Carolina')).toBe('NC');
    });

    it('handles empty or unknown state names gracefully', () => {
      expect(formatStateAbbr('')).toBe('');
      expect(formatStateAbbr(undefined)).toBe('');
      expect(formatStateAbbr('UnknownState')).toBe('UnknownState');
    });
  });

  describe('extractVenueInfo & HTML stripping', () => {
    it('extracts venue name and website from venueId object', () => {
      const gig: Igig = {
        venue: 'some text',
        tickets: '',
        datetime: null,
        venueId: {
          _id: 'v1',
          name: 'Slow Play Brewing',
          website: 'https://slowplaybrewing.com',
        },
      };
      const info = extractVenueInfo(gig);
      expect(info.venueName).toBe('Slow Play Brewing');
      expect(info.venueWebsite).toBe('https://slowplaybrewing.com');
    });

    it('strips HTML from gig.venue and extracts href when venueId is absent', () => {
      const gig: Igig = {
        venue: '<a href="https://brewery.example.com">Craft Beer Co.</a>',
        tickets: '',
        datetime: null,
      };
      const info = extractVenueInfo(gig);
      expect(info.venueName).toBe('Craft Beer Co.');
      expect(info.venueWebsite).toBe('https://brewery.example.com');
    });

    it('strips plain HTML formatting tags from venue text without href', () => {
      const gig: Igig = {
        venue: '<p><strong>The Downtown Lounge</strong></p>',
        tickets: '',
        datetime: null,
      };
      const info = extractVenueInfo(gig);
      expect(info.venueName).toBe('The Downtown Lounge');
      expect(info.venueWebsite).toBe('');
    });
  });

  describe('extractLocation', () => {
    it('prefers linked venueId city and usState', () => {
      const gig: Igig = {
        venue: 'Test',
        tickets: '',
        datetime: null,
        city: 'Gig City',
        usState: 'Gig State',
        venueId: {
          _id: 'v1',
          name: 'Venue',
          city: 'Rock Hill',
          usState: 'South Carolina',
        },
      };
      const loc = extractLocation(gig);
      expect(loc.city).toBe('Rock Hill');
      expect(loc.state).toBe('South Carolina');
    });

    it('falls back to gig city and usState when venueId has none', () => {
      const gig: Igig = {
        venue: 'Test',
        tickets: '',
        datetime: null,
        city: 'Salem',
        usState: 'VA',
      };
      const loc = extractLocation(gig);
      expect(loc.city).toBe('Salem');
      expect(loc.state).toBe('VA');
    });
  });

  describe('formatPlainDate and formatWeekdayEastern', () => {
    it('formats plain date in Eastern time with Sept abbreviation for September', () => {
      // 2026-09-26T22:00:00.000Z is 6:00 PM Eastern on Sept 26
      const date = new Date('2026-09-26T22:00:00.000Z');
      expect(formatPlainDate(date)).toBe('Sept 26');
      expect(formatWeekdayEastern(date)).toBe('Saturday');
    });

    it('formats other months appropriately', () => {
      const date = new Date('2026-10-12T18:00:00.000Z');
      expect(formatPlainDate(date)).toBe('Oct 12');
      expect(formatWeekdayEastern(date)).toBe('Monday');
    });
  });

  describe('formatTimeRangeEastern', () => {
    it('formats 6–9 PM when start is 6:00 PM Eastern and duration is 3 hours', () => {
      // 2026-09-26T22:00:00Z = 18:00 (6 PM) EDT
      const date = new Date('2026-09-26T22:00:00.000Z');
      expect(formatTimeRangeEastern(date, 3)).toBe('6–9 PM');
    });

    it('includes minutes when non-zero (6:30–9:30 PM)', () => {
      const date = new Date('2026-09-26T22:30:00.000Z');
      expect(formatTimeRangeEastern(date, 3)).toBe('6:30–9:30 PM');
    });

    it('spans AM to PM properly (11 AM–2 PM)', () => {
      const date = new Date('2026-09-26T15:00:00.000Z'); // 11:00 AM EDT
      expect(formatTimeRangeEastern(date, 3)).toBe('11 AM–2 PM');
    });

    it('returns start time alone when duration is missing or zero', () => {
      const date = new Date('2026-09-26T22:00:00.000Z');
      expect(formatTimeRangeEastern(date, 0)).toBe('6 PM');
    });
  });

  describe('isWithin7Days', () => {
    it('returns true when gig is between 0 and 7 days from reference date', () => {
      const refDate = new Date('2026-09-20T12:00:00.000Z');
      const gigDate = new Date('2026-09-26T22:00:00.000Z'); // 6 days away
      expect(isWithin7Days(gigDate, refDate)).toBe(true);
    });

    it('returns false when gig is more than 7 days away', () => {
      const refDate = new Date('2026-09-10T12:00:00.000Z');
      const gigDate = new Date('2026-09-26T22:00:00.000Z'); // 16 days away
      expect(isWithin7Days(gigDate, refDate)).toBe(false);
    });
  });

  describe('generateStartingCaption', () => {
    it('generates design-specified starting caption within 7 days', () => {
      const gig: Igig = {
        datetime: new Date('2026-09-26T22:00:00.000Z'), // Saturday 6-9 PM Eastern
        duration: 3,
        venue: 'Slow Play Brewing',
        city: 'Rock Hill',
        usState: 'South Carolina',
        tickets: '',
        venueId: {
          _id: 'v123',
          name: 'Slow Play Brewing',
          city: 'Rock Hill',
          usState: 'SC',
          website: 'www.slowplaybrewing.com',
        },
      };

      // Reference date: Sept 20, 2026 (within 7 days of Sept 26)
      const refDate = new Date('2026-09-20T12:00:00.000Z');
      const caption = generateStartingCaption(gig, { referenceDate: refDate });

      expect(caption).toContain(
        'Live music this Saturday! 🎶 Josh & Maria at Slow Play Brewing in Rock Hill, SC — Sept 26, 6–9 PM. Come grab a pint and hang out with us!',
      );
      expect(caption).toContain('www.joshandmariamusic.com<br />www.slowplaybrewing.com');
      expect(caption).toContain('#livemusic #rockhill #sc');
    });

    it('uses plain date wording instead of "this <weekday>" when beyond 7 days', () => {
      const gig: Igig = {
        datetime: new Date('2026-10-24T22:00:00.000Z'),
        duration: 3,
        venue: 'Slow Play Brewing',
        city: 'Rock Hill',
        usState: 'SC',
        tickets: '',
      };

      // Reference date: Oct 1, 2026 (> 7 days before Oct 24)
      const refDate = new Date('2026-10-01T12:00:00.000Z');
      const caption = generateStartingCaption(gig, { referenceDate: refDate });

      expect(caption).toContain('Live music Oct 24! 🎶 Josh & Maria at Slow Play Brewing in Rock Hill, SC — Oct 24, 6–9 PM.');
      expect(caption).not.toContain('this Saturday');
    });

    it('strips HTML from tickets text and includes tickets line when present', () => {
      const gig: Igig = {
        datetime: new Date('2026-09-26T22:00:00.000Z'),
        venue: 'The Spot',
        city: 'Roanoke',
        usState: 'VA',
        tickets: '<p>Tickets <strong>$15 at the door</strong></p>',
      };

      const caption = generateStartingCaption(gig);
      expect(caption).toContain('<p>Tickets $15 at the door</p>');
    });

    it('omits venue website address line when none is present', () => {
      const gig: Igig = {
        datetime: new Date('2026-09-26T22:00:00.000Z'),
        venue: 'Barn Gig',
        city: 'Salem',
        usState: 'VA',
        tickets: '',
      };

      const caption = generateStartingCaption(gig);
      expect(caption).toContain('<p>www.joshandmariamusic.com</p>');
      expect(caption).not.toContain('<br />');
    });

    it('includes both website addresses when venue website is provided in options', () => {
      const gig: Igig = {
        datetime: new Date('2026-09-26T22:00:00.000Z'),
        venue: 'The Brewery',
        city: 'Charlotte',
        usState: 'NC',
        tickets: '',
      };

      const caption = generateStartingCaption(gig, { venueWebsite: 'https://brewerysite.com' });
      expect(caption).toContain('www.joshandmariamusic.com<br />brewerysite.com');
    });
  });
});
