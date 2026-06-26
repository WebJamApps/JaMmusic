import adminVenuesUtils, {
  VENUE_TYPES, BOOKING_STATUSES, ORIGINALS_FITS, TRAVEL_BANDS, FIELD_HELP, prospectScore,
  type Ivenue,
} from 'src/containers/AdminVenues/admin-venues.utils';

const okJson = (data: unknown) => Promise.resolve({ ok: true, json: () => Promise.resolve(data) } as Response);
const failed = () => Promise.resolve({ ok: false, status: 500, statusText: 'Server Error' } as Response);

describe('AdminVenues utils', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => { fetchMock = vi.fn(); global.fetch = fetchMock as unknown as typeof fetch; });
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

  it('getCandidates GETs /outreach/candidates with the targetDates query', async () => {
    fetchMock.mockReturnValue(okJson([{ _id: 'v1', name: 'A' }]));
    await adminVenuesUtils.getCandidates('tok', 'Aug 14-16');
    expect(fetchMock.mock.calls[0][0]).toContain('/outreach/candidates?targetDates=Aug%2014-16');
  });

  it('getCandidates omits the query when no targetDates given', async () => {
    fetchMock.mockReturnValue(okJson([]));
    await adminVenuesUtils.getCandidates('tok');
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/outreach\/candidates$/);
  });

  it('sendBatch POSTs the venueIds + dates', async () => {
    fetchMock.mockReturnValue(okJson({ requested: 2, sent: 2, skipped: [], records: [] }));
    const res = await adminVenuesUtils.sendBatch('tok', { venueIds: ['a', 'b'], targetDates: 'Aug 14-16', bookingPeriod: 'August' });
    expect(res.sent).toBe(2);
    const opts = fetchMock.mock.calls[0][1] as RequestInit;
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body as string)).toMatchObject({ venueIds: ['a', 'b'], targetDates: 'Aug 14-16' });
  });

  it('getConfig GETs /outreach/config', async () => {
    fetchMock.mockReturnValue(okJson({ autoApprove: true }));
    const cfg = await adminVenuesUtils.getConfig('tok');
    expect(cfg.autoApprove).toBe(true);
    expect(fetchMock.mock.calls[0][0]).toContain('/outreach/config');
  });

  it('setConfig PUTs the autoApprove flag', async () => {
    fetchMock.mockReturnValue(okJson({ autoApprove: false }));
    const cfg = await adminVenuesUtils.setConfig('tok', false);
    expect(cfg.autoApprove).toBe(false);
    const opts = fetchMock.mock.calls[0][1] as RequestInit;
    expect(opts.method).toBe('PUT');
    expect(JSON.parse(opts.body as string)).toEqual({ autoApprove: false });
  });

  it.each([
    ['listVenues', () => adminVenuesUtils.listVenues('t')],
    ['updateVenue', () => adminVenuesUtils.updateVenue('t', '1', {})],
    ['deleteVenue', () => adminVenuesUtils.deleteVenue('t', '1')],
    ['getCandidates', () => adminVenuesUtils.getCandidates('t', 'd')],
    ['sendBatch', () => adminVenuesUtils.sendBatch('t', { venueIds: ['a'], targetDates: 'd' })],
    ['getConfig', () => adminVenuesUtils.getConfig('t')],
    ['setConfig', () => adminVenuesUtils.setConfig('t', true)],
  ])('%s throws on a non-ok response', async (_name, call) => {
    fetchMock.mockReturnValue(failed());
    await expect(call()).rejects.toThrow('500');
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
        relationshipStage: 'returning', // +1
        contactVerified: true, // +1 → warmth = 4
        priority: 5, // +5
      };
      expect(prospectScore(v)).toBe(6 + 1 + 4 + 5);
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
});
