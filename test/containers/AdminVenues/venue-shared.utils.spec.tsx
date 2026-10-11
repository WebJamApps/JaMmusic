import {
  US_STATES,
  COUNTRIES,
  validateZipCode,
  normalizeWebsiteUrl,
  validateVenueFields,
  getExistingVenueWarning,
  formatVenueSaveOutcomeMessage,
  BACKEND_SAVE_RULES,
} from 'src/containers/AdminVenues/venue-shared.utils';
import type { Ivenue } from 'src/containers/AdminVenues/admin-venues.utils';

describe('venue-shared.utils', () => {
  describe('US_STATES and COUNTRIES definitions', () => {
    it('exports complete list of US states with code and name', () => {
      expect(US_STATES.length).toBeGreaterThanOrEqual(50);
      const va = US_STATES.find((s) => s.code === 'VA');
      expect(va).toBeDefined();
      expect(va?.name).toBe('Virginia');
    });

    it('exports list of countries with code and name', () => {
      expect(COUNTRIES.length).toBeGreaterThanOrEqual(20);
      const us = COUNTRIES.find((c) => c.code === 'US');
      expect(us).toBeDefined();
      expect(us?.name).toContain('United States');
    });
  });

  describe('validateZipCode', () => {
    it('accepts valid 5-digit ZIP codes', () => {
      expect(validateZipCode('24011')).toBe(true);
      expect(validateZipCode(' 24011 ')).toBe(true);
    });

    it('accepts valid 5+4 digit ZIP codes', () => {
      expect(validateZipCode('24011-1234')).toBe(true);
      expect(validateZipCode(' 24011-1234 ')).toBe(true);
    });

    it('rejects invalid ZIP codes from specification manifest', () => {
      expect(validateZipCode('2401')).toBe(false);
      expect(validateZipCode('240111')).toBe(false);
      expect(validateZipCode('24011-123')).toBe(false);
      expect(validateZipCode('ABCDE')).toBe(false);
      expect(validateZipCode('')).toBe(false);
      expect(validateZipCode(undefined)).toBe(false);
    });
  });

  describe('normalizeWebsiteUrl', () => {
    it('returns empty url for empty or whitespace strings', () => {
      expect(normalizeWebsiteUrl('')).toEqual({ valid: true, url: '' });
      expect(normalizeWebsiteUrl('   ')).toEqual({ valid: true, url: '' });
      expect(normalizeWebsiteUrl(undefined)).toEqual({ valid: true, url: '' });
    });

    it('auto-prefixes https:// to domain names without protocol', () => {
      expect(normalizeWebsiteUrl('example.com')).toEqual({ valid: true, url: 'https://example.com' });
    });

    it('preserves existing https:// and http:// protocols', () => {
      expect(normalizeWebsiteUrl('https://example.com')).toEqual({ valid: true, url: 'https://example.com' });
      expect(normalizeWebsiteUrl('http://example.com')).toEqual({ valid: true, url: 'http://example.com' });
    });

    it('rejects invalid hostnames like "not-a-host"', () => {
      const res = normalizeWebsiteUrl('not-a-host');
      expect(res.valid).toBe(false);
      expect(res.error).toBe('A valid website URL is required');
    });
  });

  describe('validateVenueFields', () => {
    const validCreateFields = {
      name: 'The Spot',
      address: '123 Main St',
      city: 'Salem',
      usState: 'VA',
      zipCode: '24011',
      country: 'US',
      website: 'example.com',
    };

    it('passes for valid create fields', () => {
      const res = validateVenueFields(validCreateFields, { mode: 'create' });
      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
      expect(res.errors).toEqual({});
      expect(res.formattedWebsite).toBe('https://example.com');
    });

    it('rejects empty and whitespace-only name', () => {
      const resEmpty = validateVenueFields({ ...validCreateFields, name: '' }, { mode: 'create' });
      expect(resEmpty.valid).toBe(false);
      expect(resEmpty.error).toBe('Name is required');
      expect(resEmpty.errors.name).toBe('Name is required');

      const resWhitespace = validateVenueFields({ ...validCreateFields, name: '   ' }, { mode: 'create' });
      expect(resWhitespace.valid).toBe(false);
      expect(resWhitespace.error).toBe('Name is required');
    });

    it('rejects empty and whitespace-only street address on create', () => {
      const resEmpty = validateVenueFields({ ...validCreateFields, address: '' }, { mode: 'create' });
      expect(resEmpty.valid).toBe(false);
      expect(resEmpty.error).toBe('Street address is required');
      expect(resEmpty.errors.address).toBe('Street address is required');

      const resWhitespace = validateVenueFields({ ...validCreateFields, address: '   ' }, { mode: 'create' });
      expect(resWhitespace.valid).toBe(false);
      expect(resWhitespace.error).toBe('Street address is required');
    });

    it('rejects empty and whitespace-only city on create', () => {
      const resEmpty = validateVenueFields({ ...validCreateFields, city: '' }, { mode: 'create' });
      expect(resEmpty.valid).toBe(false);
      expect(resEmpty.error).toBe('City is required');
      expect(resEmpty.errors.city).toBe('City is required');

      const resWhitespace = validateVenueFields({ ...validCreateFields, city: '   ' }, { mode: 'create' });
      expect(resWhitespace.valid).toBe(false);
      expect(resWhitespace.error).toBe('City is required');
    });

    it('rejects empty and whitespace-only zip code on create', () => {
      const resEmpty = validateVenueFields({ ...validCreateFields, zipCode: '' }, { mode: 'create' });
      expect(resEmpty.valid).toBe(false);
      expect(resEmpty.error).toBe('Zip code is required');
      expect(resEmpty.errors.zipCode).toBe('Zip code is required');

      const resWhitespace = validateVenueFields({ ...validCreateFields, zipCode: '   ' }, { mode: 'create' });
      expect(resWhitespace.valid).toBe(false);
      expect(resWhitespace.error).toBe('Zip code is required');
    });

    it('accepts ZIP fixtures "24011" and "24011-1234"', () => {
      const res1 = validateVenueFields({ ...validCreateFields, zipCode: '24011' }, { mode: 'create' });
      expect(res1.valid).toBe(true);

      const res2 = validateVenueFields({ ...validCreateFields, zipCode: '24011-1234' }, { mode: 'create' });
      expect(res2.valid).toBe(true);
    });

    it('rejects invalid ZIP fixtures "2401", "240111", "24011-123", "ABCDE"', () => {
      for (const zip of ['2401', '240111', '24011-123', 'ABCDE']) {
        const res = validateVenueFields({ ...validCreateFields, zipCode: zip }, { mode: 'create' });
        expect(res.valid).toBe(false);
        expect(res.error).toBe('Zip code must be a valid 5-digit ZIP code');
        expect(res.errors.zipCode).toBe('Zip code must be a valid 5-digit ZIP code');
      }
    });

    it('validates state requirement for US venues', () => {
      const res = validateVenueFields({ ...validCreateFields, usState: '', country: 'US' }, { mode: 'create' });
      expect(res.valid).toBe(false);
      expect(res.error).toBe('State is required for US venues');
      expect(res.errors.usState).toBe('State is required for US venues');

      const resWhitespace = validateVenueFields({ ...validCreateFields, usState: '   ' }, { mode: 'create' });
      expect(resWhitespace.valid).toBe(false);
      expect(resWhitespace.error).toBe('State is required for US venues');
    });

    it('bypasses state requirement for non-US country', () => {
      const res = validateVenueFields({
        ...validCreateFields,
        usState: '',
        country: 'CA',
      }, { mode: 'create' });
      expect(res.valid).toBe(true);
      expect(res.errors.usState).toBeUndefined();
    });

    it('accepts optional website fixtures "", "example.com", "https://example.com", "http://example.com"', () => {
      for (const web of ['', 'example.com', 'https://example.com', 'http://example.com']) {
        const res = validateVenueFields({ ...validCreateFields, website: web }, { mode: 'create' });
        expect(res.valid).toBe(true);
      }
    });

    it('rejects invalid website host fixture "not-a-host"', () => {
      const res = validateVenueFields({ ...validCreateFields, website: 'not-a-host' }, { mode: 'create' });
      expect(res.valid).toBe(false);
      expect(res.error).toBe('A valid website URL is required');
      expect(res.errors.website).toBe('A valid website URL is required');
    });

    describe('edit mode', () => {
      const originalVenue: Ivenue = {
        _id: 'v1',
        name: 'The Spot',
        address: '123 Main St',
        city: 'Salem',
        usState: 'VA',
        zipCode: '24011',
      };

      it('prevents removing address when already on file', () => {
        const resEmpty = validateVenueFields({
          name: 'The Spot',
          address: '',
          city: 'Salem',
          usState: 'VA',
          zipCode: '24011',
        }, { mode: 'edit', originalVenue });
        expect(resEmpty.valid).toBe(false);
        expect(resEmpty.error).toBe("Address can't be removed — enter the corrected address");

        const resWhitespace = validateVenueFields({
          name: 'The Spot',
          address: '   ',
          city: 'Salem',
          usState: 'VA',
          zipCode: '24011',
        }, { mode: 'edit', originalVenue });
        expect(resWhitespace.valid).toBe(false);
        expect(resWhitespace.error).toBe("Address can't be removed — enter the corrected address");
      });

      it('allows empty address when original record had no address on file', () => {
        const venueWithoutAddr: Ivenue = {
          _id: 'v2',
          name: 'Old Venue',
          address: '',
          city: 'Salem',
          usState: 'VA',
        };
        const res = validateVenueFields({
          name: 'Old Venue',
          address: '',
          city: 'Salem',
          usState: 'VA',
        }, { mode: 'edit', originalVenue: venueWithoutAddr });
        expect(res.valid).toBe(true);
      });

      it('prevents removing zip code when already on file', () => {
        const resEmpty = validateVenueFields({
          name: 'The Spot',
          address: '123 Main St',
          city: 'Salem',
          usState: 'VA',
          zipCode: '',
        }, { mode: 'edit', originalVenue });
        expect(resEmpty.valid).toBe(false);
        expect(resEmpty.error).toBe("Zip code can't be removed — enter the corrected zip code");
      });

      it('allows empty zip code when original record had no zip code on file', () => {
        const venueWithoutZip: Ivenue = {
          _id: 'v3',
          name: 'Old Venue',
          address: '123 Main St',
          city: 'Salem',
          usState: 'VA',
          zipCode: '',
        };
        const res = validateVenueFields({
          name: 'Old Venue',
          address: '123 Main St',
          city: 'Salem',
          usState: 'VA',
          zipCode: '',
        }, { mode: 'edit', originalVenue: venueWithoutZip });
        expect(res.valid).toBe(true);
      });

      it('prevents removing city when already on file', () => {
        const resEmpty = validateVenueFields({
          name: 'The Spot',
          address: '123 Main St',
          city: '',
          usState: 'VA',
          zipCode: '24011',
        }, { mode: 'edit', originalVenue });
        expect(resEmpty.valid).toBe(false);
        expect(resEmpty.error).toBe("City can't be removed — enter the corrected city");
      });
    });
  });

  describe('getExistingVenueWarning', () => {
    const inventory: Ivenue[] = [
      { _id: 'v1', name: 'test venue', city: 'salem', address: '1 Electric Road' },
      { _id: 'v2', name: 'test venue', city: 'Roanoke', address: '2 Electric Road' },
      { _id: 'v3', name: 'test venue', city: 'salem', address: '' },
      { _id: 'v4', name: 'test venue', city: 'salem', address: '1 Electric Rd', status: 'archived' },
      { _id: 'v5', name: 'other venue', city: 'salem', address: '500 Broad St' },
    ];

    it('throws when inventory is missing or not an array', () => {
      expect(() => getExistingVenueWarning({
        name: 'Test Venue',
        city: 'Salem',
        inventory: null as unknown as Ivenue[],
        mode: 'create',
      })).toThrow('Venue inventory is required to check for existing venues');

      expect(() => getExistingVenueWarning({
        name: 'Test Venue',
        city: 'Salem',
        inventory: undefined as unknown as Ivenue[],
        mode: 'create',
      })).toThrow('Venue inventory is required to check for existing venues');
    });

    it('returns hasWarning false when name is blank or whitespace', () => {
      const resEmpty = getExistingVenueWarning({ name: '', city: 'Salem', inventory, mode: 'create' });
      expect(resEmpty.hasWarning).toBe(false);
      expect(resEmpty.message).toBe('');

      const resWhitespace = getExistingVenueWarning({ name: '   ', city: 'Salem', inventory, mode: 'create' });
      expect(resWhitespace.hasWarning).toBe(false);
      expect(resWhitespace.message).toBe('');
    });

    it('matches literal name/city pairs " Test Venue " / " Salem " against "test venue" / "salem"', () => {
      const res = getExistingVenueWarning({
        name: ' Test Venue ',
        city: ' Salem ',
        inventory,
        mode: 'create',
      });
      expect(res.hasWarning).toBe(true);
      expect(res.matchingVenues).toHaveLength(4);
      expect(res.sameCityMatches).toHaveLength(3); // v1, v3, v4
      expect(res.differentCityMatches).toHaveLength(1); // v2 (Roanoke)
    });

    it('displays existing matched addresses "1 Electric Road", "1 Electric Rd", "2 Electric Road"', () => {
      const res = getExistingVenueWarning({
        name: ' Test Venue ',
        city: ' Salem ',
        inventory,
        mode: 'create',
      });
      expect(res.matchedAddresses).toContain('1 Electric Road');
      expect(res.matchedAddresses).toContain('1 Electric Rd');
      expect(res.matchedAddresses).toContain('2 Electric Road');
      expect(res.message).toContain('1 Electric Road');
      expect(res.message).toContain('1 Electric Rd');
    });

    it('identifies archived matching record and explains it will be restored if matched', () => {
      const res = getExistingVenueWarning({
        name: 'Test Venue',
        city: 'Salem',
        inventory,
        mode: 'create',
      });
      expect(res.hasArchivedMatch).toBe(true);
      expect(res.message).toContain('An archived matching record was found. If matched upon save, it will be restored and made active.');
      expect(res.message).toContain('[archived]');
    });

    it('explains single address-less candidate fallback', () => {
      const singleAddresslessInventory: Ivenue[] = [
        { _id: 'v1', name: 'Test Venue', city: 'Salem', address: '1 Electric Road' },
        { _id: 'v3', name: 'Test Venue', city: 'Salem', address: '' },
      ];
      const res = getExistingVenueWarning({
        name: 'Test Venue',
        city: 'Salem',
        inventory: singleAddresslessInventory,
        mode: 'create',
      });
      expect(res.addresslessCount).toBe(1);
      expect(res.message).toContain(
        'One same-name-and-city record has no address on file. '
        + 'If no street address matches, saving will update that older record and make it active.',
      );
    });

    it('explains two address-less candidates refusal', () => {
      const twoAddresslessInventory: Ivenue[] = [
        { _id: 'v1', name: 'Test Venue', city: 'Salem', address: '' },
        { _id: 'v2', name: 'Test Venue', city: 'Salem', address: '' },
      ];
      const res = getExistingVenueWarning({
        name: 'Test Venue',
        city: 'Salem',
        inventory: twoAddresslessInventory,
        mode: 'create',
      });
      expect(res.addresslessCount).toBe(2);
      expect(res.message).toContain(
        'Several same-name-and-city records have no address on file. '
        + 'If no street address matches, the backend will refuse to guess and return an error.',
      );
    });

    it('explains separate venue creation for candidates in different cities (e.g. Roanoke)', () => {
      const roanokeInventory: Ivenue[] = [
        { _id: 'v2', name: 'Test Venue', city: 'Roanoke', address: '2 Electric Road' },
      ];
      const res = getExistingVenueWarning({
        name: 'Test Venue',
        city: 'Salem',
        inventory: roanokeInventory,
        mode: 'create',
      });
      expect(res.hasWarning).toBe(true);
      expect(res.differentCityMatches).toHaveLength(1);
      expect(res.message).toContain('Matching venue(s) in a different city will result in creating a separate venue.');
    });

    it('includes all approved backend save conditions in create mode', () => {
      const res = getExistingVenueWarning({
        name: 'Test Venue',
        city: 'Salem',
        inventory,
        mode: 'create',
      });
      expect(res.rulesExplanation.sameAddressRule).toBe(BACKEND_SAVE_RULES.sameAddressRule);
      expect(res.rulesExplanation.differentCityRule).toBe(BACKEND_SAVE_RULES.differentCityRule);
      expect(res.rulesExplanation.differentAddressRule).toBe(BACKEND_SAVE_RULES.differentAddressRule);
      expect(res.rulesExplanation.singleAddresslessRule).toBe(BACKEND_SAVE_RULES.singleAddresslessRule);
      expect(res.rulesExplanation.multipleAddresslessRule).toBe(BACKEND_SAVE_RULES.multipleAddresslessRule);
      expect(res.message).toContain(BACKEND_SAVE_RULES.sameAddressRule);
      expect(res.message).toContain(BACKEND_SAVE_RULES.differentCityRule);
      expect(res.message).toContain(BACKEND_SAVE_RULES.differentAddressRule);
      expect(res.message).toContain(BACKEND_SAVE_RULES.singleAddresslessRule);
      expect(res.message).toContain(BACKEND_SAVE_RULES.multipleAddresslessRule);
    });

    describe('edit mode', () => {
      it('explains PATCH of selected record without claiming create or unarchive', () => {
        const res = getExistingVenueWarning({
          name: 'Test Venue',
          city: 'Salem',
          inventory,
          mode: 'edit',
          selectedVenueId: 'v1',
        });
        expect(res.hasWarning).toBe(true);
        expect(res.message).toContain('Saving will edit the selected record (via PATCH)');
        expect(res.message).toContain('It will not create another record or restore another match');
        expect(res.message).toContain('address: 2 Electric Road, 1 Electric Rd');
      });

      it('excludes selectedVenueId from candidate matches', () => {
        const soloInventory: Ivenue[] = [
          { _id: 'v1', name: 'Test Venue', city: 'Salem', address: '1 Electric Road' },
        ];
        const res = getExistingVenueWarning({
          name: 'Test Venue',
          city: 'Salem',
          inventory: soloInventory,
          mode: 'edit',
          selectedVenueId: 'v1',
        });
        expect(res.hasWarning).toBe(false);
        expect(res.matchingVenues).toHaveLength(0);
      });
    });
  });

  describe('formatVenueSaveOutcomeMessage', () => {
    it('formats created outcome message', () => {
      expect(formatVenueSaveOutcomeMessage('created')).toBe('Venue created');
      expect(formatVenueSaveOutcomeMessage({ outcome: 'created' })).toBe('Venue created');
    });

    it('formats updated outcome message for active venue', () => {
      expect(formatVenueSaveOutcomeMessage('updated')).toBe('Existing venue updated');
      expect(formatVenueSaveOutcomeMessage('updated', false)).toBe('Existing venue updated');
      expect(formatVenueSaveOutcomeMessage({ outcome: 'updated', wasArchived: false })).toBe('Existing venue updated');
    });

    it('formats updated outcome message for restored archived venue', () => {
      expect(formatVenueSaveOutcomeMessage('updated', true)).toBe('Existing archived venue restored and updated');
      expect(formatVenueSaveOutcomeMessage({ outcome: 'updated', wasArchived: true })).toBe('Existing archived venue restored and updated');
    });
  });
});
