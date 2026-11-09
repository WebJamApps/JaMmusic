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
  decodeHtmlEntities,
  htmlCaptionToText,
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
    it('formats "from 6 to 9 PM" when start is 6:00 PM Eastern and duration is 3 hours', () => {
      // 2026-09-26T22:00:00Z = 18:00 (6 PM) EDT
      const date = new Date('2026-09-26T22:00:00.000Z');
      expect(formatTimeRangeEastern(date, 3)).toBe('from 6 to 9 PM');
    });

    it('includes minutes when non-zero (from 6:30 to 9:30 PM)', () => {
      const date = new Date('2026-09-26T22:30:00.000Z');
      expect(formatTimeRangeEastern(date, 3)).toBe('from 6:30 to 9:30 PM');
    });

    it('spans AM to PM properly ("from 11 AM to 2 PM")', () => {
      const date = new Date('2026-09-26T15:00:00.000Z'); // 11:00 AM EDT
      expect(formatTimeRangeEastern(date, 3)).toBe('from 11 AM to 2 PM');
    });

    it('formats "at 7 PM" when start is 7:00 PM Eastern and duration is missing or zero', () => {
      // 2026-09-26T23:00:00Z = 19:00 (7 PM) EDT
      const date7pm = new Date('2026-09-26T23:00:00.000Z');
      expect(formatTimeRangeEastern(date7pm, 0)).toBe('at 7 PM');
      expect(formatTimeRangeEastern(date7pm)).toBe('at 7 PM');
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
    it('generates design-specified starting caption with "Saturday Nov 14" and "from 6 to 9 PM", containing no en dash or em dash', () => {
      // 2026-11-14T23:00:00.000Z = 6:00 PM EST on Saturday Nov 14
      const gig: Igig = {
        datetime: new Date('2026-11-14T23:00:00.000Z'),
        duration: 3,
        venue: 'Durty Bull Brewing Company',
        city: 'Gastonia',
        usState: 'North Carolina',
        tickets: '',
        venueId: {
          _id: 'v123',
          name: 'Durty Bull Brewing Company',
          city: 'Gastonia',
          usState: 'NC',
          website: 'www.durtybull.com',
        },
      };

      const caption = generateStartingCaption(gig);

      expect(caption).toContain('Saturday Nov 14');
      expect(caption).toContain(
        'Live music Saturday Nov 14! 🎶 Josh & Maria at Durty Bull Brewing Company in Gastonia, NC from 6 to 9 PM. '
        + 'Come grab a pint and hang out with us!',
      );
      expect(caption).toContain('www.joshandmariamusic.com<br />www.durtybull.com');
      expect(caption).toContain('#livemusic #gastonia #nc');

      // Verify NO en dash or em dash in generated caption
      expect(caption).not.toContain('–');
      expect(caption).not.toContain('—');
      expect(caption).not.toMatch(/[–—]/);
    });

    it('generates starting caption with "from 11 AM to 2 PM" and contains no dashes', () => {
      const gig: Igig = {
        datetime: new Date('2026-09-26T15:00:00.000Z'), // Saturday 11 AM EDT
        duration: 3,
        venue: 'Brunch Cafe',
        city: 'Charlotte',
        usState: 'NC',
        tickets: '',
      };

      const caption = generateStartingCaption(gig);
      expect(caption).toContain('from 11 AM to 2 PM');
      expect(caption).not.toMatch(/[–—]/);
    });

    it('generates starting caption with "at 7 PM" when no duration is specified', () => {
      const gig: Igig = {
        datetime: new Date('2026-09-26T23:00:00.000Z'), // Saturday 7 PM EDT
        venue: 'Slow Play Brewing',
        city: 'Rock Hill',
        usState: 'SC',
        tickets: '',
      };

      const caption = generateStartingCaption(gig);
      expect(caption).toContain('at 7 PM');
      expect(caption).not.toMatch(/[–—]/);
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

  describe('decodeHtmlEntities and htmlCaptionToText', () => {
    it('decodes HTML entities correctly', () => {
      expect(decodeHtmlEntities('&amp; &lt; &gt; &quot; &#39; &nbsp; &eacute;')).toBe('& < > " \'   é');
      expect(decodeHtmlEntities('&#x2013;')).toBe('–');
      expect(decodeHtmlEntities('&#8212;')).toBe('—');
      expect(decodeHtmlEntities('&copy; 2026 &euro;50 &trade; &hellip; &frac12;')).toBe('© 2026 €50 ™ … ½');
      expect(decodeHtmlEntities('&foobar;')).toBe('&foobar;');
      expect(decodeHtmlEntities('')).toBe('');
    });

    it('converts rich HTML caption into plain text for Instagram and Facebook', () => {
      const html = `<p>Live music Saturday Nov 14! 🎶 Josh & Maria at Durty Bull &amp; Co.</p>
<p><a href="https://www.durtybull.com/">Durty Bull Website</a><br />www.joshandmariamusic.com</p>
<p>#livemusic #gastonia</p>`;

      const plainText = htmlCaptionToText(html);
      expect(plainText).toBe(`Live music Saturday Nov 14! 🎶 Josh & Maria at Durty Bull & Co.

https://www.durtybull.com/
www.joshandmariamusic.com

#livemusic #gastonia`);
    });
  });
});
