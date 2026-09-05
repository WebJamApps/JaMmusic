import adminVenuesUtils, {
  VENUE_TYPES, BOOKING_STATUSES, AUDIENCE_ATTENTIONS, FIELD_HELP, prospectScore,
  type Ivenue,
} from 'src/containers/AdminVenues/admin-venues.utils';

const mockRowGetCell = {
  value: '' as any,
  font: {} as any,
};

const mockRow = {
  height: 20,
  getCell: vi.fn(),
};

const mockWorksheet = {
  columns: [] as any[],
  getRow: vi.fn(),
  addRow: vi.fn(),
};

const mockAddWorksheet = vi.fn();
const mockWriteBuffer = vi.fn();

const mockWorkbook = {
  addWorksheet: mockAddWorksheet,
  xlsx: {
    writeBuffer: mockWriteBuffer,
  },
};

vi.mock('exceljs', () => {
  const WorkbookClass = class {
    addWorksheet(...args: any[]) {
      return mockAddWorksheet(...args);
    }
    get xlsx() {
      return { writeBuffer: mockWriteBuffer };
    }
  };
  return {
    Workbook: WorkbookClass,
    default: { Workbook: WorkbookClass },
  };
});

const okJson = (data: unknown) => Promise.resolve({ ok: true, json: () => Promise.resolve(data) } as Response);
const failed = () => Promise.resolve({ ok: false, status: 500, statusText: 'Server Error' } as Response);

describe('AdminVenues utils', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    mockRow.getCell.mockReturnValue(mockRowGetCell);
    mockWorksheet.getRow.mockReturnValue({
      font: {} as any,
      eachCell: vi.fn().mockImplementation((cb: any) => {
        cb({ fill: {}, alignment: {} }, 1);
      }),
      height: 25,
    });
    mockWorksheet.addRow.mockReturnValue(mockRow);
    mockAddWorksheet.mockReturnValue(mockWorksheet);
    mockWriteBuffer.mockResolvedValue(new ArrayBuffer(8));
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('listVenues GETs with a bearer token', async () => {
    fetchMock.mockReturnValue(okJson([{ _id: 'v1', name: 'A' }]));
    const venues = await adminVenuesUtils.listVenues('tok');
    expect(venues).toHaveLength(1);
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toContain('/venue');
    expect((opts as RequestInit).headers).toMatchObject({ Authorization: 'Bearer tok' });
  });

  it('updateVenue PATCHes to the venue id with the payload', async () => {
    fetchMock.mockReturnValue(okJson({ _id: 'v2', name: 'B' }));
    await adminVenuesUtils.updateVenue('tok', 'v2', { bookingStatus: 'booked', outreachEligible: true });
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toContain('/venue/v2');
    expect((opts as RequestInit).method).toBe('PATCH');
    expect(JSON.parse((opts as RequestInit).body as string)).toMatchObject({ bookingStatus: 'booked' });
  });

  it('listVenues adds the eligibleFor query when a target date is given', async () => {
    fetchMock.mockReturnValue(okJson([]));
    await adminVenuesUtils.listVenues('tok', '2026-08-15');
    expect(fetchMock.mock.calls[0][0]).toContain('/venue?eligibleFor=2026-08-15');
  });

  it('deleteVenue DELETEs the venue id', async () => {
    fetchMock.mockReturnValue(Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response));
    await adminVenuesUtils.deleteVenue('tok', 'v9');
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toContain('/venue/v9');
    expect((opts as RequestInit).method).toBe('DELETE');
    expect((opts as RequestInit).headers).toMatchObject({ Authorization: 'Bearer tok' });
  });

  it.each([
    ['listVenues', () => adminVenuesUtils.listVenues('t')],
    ['updateVenue', () => adminVenuesUtils.updateVenue('t', '1', {})],
    ['deleteVenue', () => adminVenuesUtils.deleteVenue('t', '1')],
  ])('%s throws on a non-ok response', async (_name, call) => {
    fetchMock.mockReturnValue(failed());
    await expect(call()).rejects.toThrow('500');
  });

  it('triggers auth:logout event on 401 response', async () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    fetchMock.mockReturnValue(Promise.resolve({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: () => Promise.resolve({ message: 'Token invalid' }),
    } as Response));
    await expect(adminVenuesUtils.listVenues('bad-tok')).rejects.toThrow('Token invalid');
    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'auth:logout' }));
  });

  it('parses and throws JSON error messages from the backend', async () => {
    const jsonErrorResponse = Promise.resolve({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ message: 'A valid email is required' }),
    } as Response);
    fetchMock.mockReturnValue(jsonErrorResponse);
    await expect(adminVenuesUtils.updateVenue('t', '1', {})).rejects.toThrow('A valid email is required');
  });

  it('exports the venue-type, booking-status, and audience-attention option lists', () => {
    expect(VENUE_TYPES).toContain('Originals');
    expect(BOOKING_STATUSES).toContain('booked');
    expect(AUDIENCE_ATTENTIONS).toEqual(['low', 'medium', 'high']);
    expect(FIELD_HELP.outreachEligible).toContain('SAFETY GATE');
    expect(FIELD_HELP.payAmount).toContain('$150');
    expect(FIELD_HELP.audienceAttention).toContain('Room listening level');
    expect(FIELD_HELP.personalFavorite).toContain('patrons');
    expect(FIELD_HELP.familyNearby).toContain('Auto-derived');
    expect(typeof adminVenuesUtils.getAllowedAdminRoles).toBe('function');
  });

  describe('prospectScore', () => {
    it('sums attention (0/3/6), pay-as-share-of-150 (max 6), family (3), favorite (2), minus distance penalty (max 3)', () => {
      const maxVenue: Ivenue = {
        _id: 'top',
        name: 'Top Venue',
        audienceAttention: 'high', // +6
        payAmount: 150, // +6
        familyNearby: true, // +3
        personalFavorite: true, // +2
        distanceKm: 0, // -0
      };
      expect(prospectScore(maxVenue)).toBe(17);
    });

    it('floors at 0 when distance penalty exceeds score and handles unset fields', () => {
      expect(prospectScore({ _id: 'a', name: 'A' })).toBe(0);
      expect(prospectScore({ _id: 'b', name: 'B', distanceKm: 100 })).toBe(0);
      expect(prospectScore({ _id: 'c', name: 'C', distanceKm: 150 })).toBe(0);
    });

    it('scales payAmount proportionally up to 150 capped at 6', () => {
      expect(prospectScore({ _id: 'p75', name: 'P75', payAmount: 75 })).toBe(3);
      expect(prospectScore({ _id: 'p30', name: 'P30', payAmount: 30 })).toBe(1.2);
      expect(prospectScore({ _id: 'p300', name: 'P300', payAmount: 300 })).toBe(6);
      expect(prospectScore({ _id: 'p0', name: 'P0', payAmount: 0 })).toBe(0);
    });

    it('rates audienceAttention properly across levels', () => {
      expect(prospectScore({ _id: 'h', name: 'H', audienceAttention: 'high' })).toBe(6);
      expect(prospectScore({ _id: 'm', name: 'M', audienceAttention: 'medium' })).toBe(3);
      expect(prospectScore({ _id: 'l', name: 'L', audienceAttention: 'low' })).toBe(0);
      expect(prospectScore({ _id: 'u', name: 'U', audienceAttention: '' })).toBe(0);
    });

    it('applies family nearby and personal favorite flat additions', () => {
      expect(prospectScore({ _id: 'fam', name: 'Fam', familyNearby: true })).toBe(3);
      expect(prospectScore({ _id: 'fav', name: 'Fav', personalFavorite: true })).toBe(2);
    });

    it('exactly cancels max distance penalty with family nearby', () => {
      // Harrisonburg Farmers Market example from design doc: ~160 km (-3 distance) + 3 family = 0 net adjustment
      const hburg: Ivenue = {
        _id: 'hburg',
        name: 'Harrisonburg Farmers Market',
        payAmount: 150, // +6
        audienceAttention: 'high', // +6
        distanceKm: 160, // -3 (capped)
        familyNearby: true, // +3
      };
      expect(prospectScore(hburg)).toBe(12);
    });

    it('falls back to distance property if distanceKm is omitted', () => {
      expect(prospectScore({ _id: 'd', name: 'D', payAmount: 150, distance: 50 })).toBe(4.5);
    });
  });

  describe('exportVenuesToExcel', () => {
    const originalCreateObjectURL = global.URL.createObjectURL;
    const originalRevokeObjectURL = global.URL.revokeObjectURL;

    beforeEach(() => {
      global.URL.createObjectURL = vi.fn().mockReturnValue('blob:url');
      global.URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
      global.URL.createObjectURL = originalCreateObjectURL;
      global.URL.revokeObjectURL = originalRevokeObjectURL;
    });

    it('creates workbook, adds worksheet, adds rows, and downloads the excel file', async () => {
      const mockClick = vi.fn();
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
      };
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') return mockAnchor as any;
        return document.createElement(tag);
      });

      const venues: Ivenue[] = [
        {
          _id: '1',
          name: 'The Spot',
          city: 'Salem',
          usState: 'VA',
          venueType: 'Originals',
          contactName: 'John',
          email: 'john@thespot.com',
          secondaryEmail: 'john.sec@thespot.com',
          phone: '123-456-7890',
          website: 'www.thespot.com',
          outreachEligible: true,
          inScope: true,
          bookingStatus: 'booking',
          payAmount: 150,
          audienceAttention: 'high',
          personalFavorite: true,
          familyNearby: true,
          templateOverride: 'Originals',
          notes: 'Great venue with a booking link at http://thespot.com/booking',
        },
      ];

      await adminVenuesUtils.exportVenuesToExcel(venues);

      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('Venues');
      expect(mockWorksheet.addRow).toHaveBeenCalledWith(expect.objectContaining({
        payAmount: 150,
        audienceAttention: 'high',
        personalFavorite: 'Yes',
        familyNearby: 'Yes',
      }));
      expect(mockClick).toHaveBeenCalled();
      expect(mockAnchor.download).toBe('venues_export.xlsx');
      expect(mockAnchor.href).toBe('blob:url');

      createElementSpy.mockRestore();
    });
  });

  describe('getGoogleMapsUrl', () => {
    it('generates the expected Google Maps URL with full address, city, and state', () => {
      const url = adminVenuesUtils.getGoogleMapsUrl('123 Main St', 'Salem', 'VA');
      expect(url).toBe('https://www.google.com/maps/search/?api=1&query=123%20Main%20St%2C%20Salem%2C%20VA');
    });

    it('handles missing city or state gracefully', () => {
      const urlAddressOnly = adminVenuesUtils.getGoogleMapsUrl('123 Main St');
      expect(urlAddressOnly).toBe('https://www.google.com/maps/search/?api=1&query=123%20Main%20St');

      const urlCityState = adminVenuesUtils.getGoogleMapsUrl(undefined, 'Roanoke', 'VA');
      expect(urlCityState).toBe('https://www.google.com/maps/search/?api=1&query=Roanoke%2C%20VA');
    });

    it('trims whitespace and handles undefined inputs', () => {
      const url = adminVenuesUtils.getGoogleMapsUrl('  456 Oak Ave  ', '  Blacksburg  ', '  VA  ');
      expect(url).toBe('https://www.google.com/maps/search/?api=1&query=456%20Oak%20Ave%2C%20Blacksburg%2C%20VA');
    });
  });
});

