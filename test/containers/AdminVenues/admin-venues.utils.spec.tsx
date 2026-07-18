import adminVenuesUtils, {
  VENUE_TYPES, BOOKING_STATUSES, ORIGINALS_FITS, TRAVEL_BANDS, FIELD_HELP, prospectScore,
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

  it('updateVenue PUTs to the venue id with the payload', async () => {
    fetchMock.mockReturnValue(okJson({ _id: 'v2', name: 'B' }));
    await adminVenuesUtils.updateVenue('tok', 'v2', { bookingStatus: 'booked', interested: true });
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toContain('/venue/v2');
    expect((opts as RequestInit).method).toBe('PUT');
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

  it('exports the venue-type and booking-status option lists', () => {
    expect(VENUE_TYPES).toContain('Originals');
    expect(BOOKING_STATUSES).toContain('booked');
    expect(ORIGINALS_FITS).toEqual(['none', 'some', 'loves']);
    expect(TRAVEL_BANDS).toEqual(['local', 'regional', 'far']);
    expect(FIELD_HELP.outreachEligible).toContain('SAFETY GATE');
    expect(typeof adminVenuesUtils.getAllowedAdminRoles).toBe('function');
  });

  describe('prospectScore', () => {
    it('sums originalsFit (heaviest), value (pay − travel), warmth, and priority', () => {
      const v: Ivenue = {
        _id: 'x',
        name: 'X',
        originalsFit: 'loves', // +6
        payTier: '$$$', // +3
        travelBand: 'far', // −2 → value = 1
        interested: true, // +2
        relationshipStage: 'returning', // +1 → warmth = 3
        priority: 5, // +5
      };
      expect(prospectScore(v)).toBe(6 + 1 + 3 + 5);
    });

    it('treats unset fit/travel/pay as zero and counts $ signs for pay', () => {
      expect(prospectScore({ _id: 'a', name: 'A' })).toBe(0);
      expect(prospectScore({ _id: 'b', name: 'B', payTier: '$$' })).toBe(2);
      expect(prospectScore({ _id: 'c', name: 'C', payTier: 'free' })).toBe(0);
    });

    it('ranks a strong-fit far venue above a no-fit local high-pay one', () => {
      const passion: Ivenue = {
        _id: 'p', name: 'P', originalsFit: 'loves', payTier: '$', travelBand: 'far', interested: true, priority: 5,
      };
      const covers: Ivenue = {
        _id: 'q', name: 'Q', originalsFit: 'none', payTier: '$$$', travelBand: 'local', interested: true, priority: 0,
      };
      expect(prospectScore(passion)).toBeGreaterThan(prospectScore(covers));
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
          interested: true,
          payTier: '$$',
          originalsFit: 'loves',
          travelBand: 'local',
          priority: 3,
          relationshipStage: 'cold',
          templateOverride: 'Originals',
          notes: 'Great venue with a booking link at http://thespot.com/booking',
        },
      ];

      await adminVenuesUtils.exportVenuesToExcel(venues);

      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('Venues');
      expect(mockWorksheet.addRow).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockAnchor.download).toBe('venues_export.xlsx');
      expect(mockAnchor.href).toBe('blob:url');

      createElementSpy.mockRestore();
    });
  });
});

