import outreachUtils from 'src/containers/AdminOutreach/outreach.utils';

const okJson = (data: unknown) => Promise.resolve({ ok: true, json: () => Promise.resolve(data) } as Response);
const failed = () => Promise.resolve({ ok: false, status: 500, statusText: 'Server Error' } as Response);

describe('Outreach utils', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => { fetchMock = vi.fn(); global.fetch = fetchMock as unknown as typeof fetch; });
  afterEach(() => { vi.restoreAllMocks(); });

  it('getCandidates GETs /outreach/candidates with targetDates and eligibleFor query', async () => {
    fetchMock.mockReturnValue(okJson([{ _id: 'v1', name: 'A' }]));
    await outreachUtils.getCandidates('tok', 'Aug 14-16', '2026-08-14');
    expect(fetchMock.mock.calls[0][0]).toContain('/outreach/candidates?targetDates=Aug%2014-16&eligibleFor=2026-08-14');
  });

  it('getCandidates omits the query when no targetDates given', async () => {
    fetchMock.mockReturnValue(okJson([]));
    await outreachUtils.getCandidates('tok');
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/outreach\/candidates$/);
  });

  it('sendBatch POSTs the venueIds + dates', async () => {
    fetchMock.mockReturnValue(okJson({ requested: 2, sent: 2, skipped: [], records: [] }));
    const res = await outreachUtils.sendBatch('tok', { venueIds: ['a', 'b'], targetDates: 'Aug 14-16', bookingPeriod: 'August' });
    expect(res.sent).toBe(2);
    const opts = fetchMock.mock.calls[0][1] as RequestInit;
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body as string)).toMatchObject({ venueIds: ['a', 'b'], targetDates: 'Aug 14-16' });
  });

  it('getConfig GETs /outreach/config', async () => {
    fetchMock.mockReturnValue(okJson({ autoApprove: true }));
    const cfg = await outreachUtils.getConfig('tok');
    expect(cfg.autoApprove).toBe(true);
    expect(fetchMock.mock.calls[0][0]).toContain('/outreach/config');
  });

  it('setConfig PUTs the autoApprove flag', async () => {
    fetchMock.mockReturnValue(okJson({ autoApprove: false }));
    const cfg = await outreachUtils.setConfig('tok', false);
    expect(cfg.autoApprove).toBe(false);
    const opts = fetchMock.mock.calls[0][1] as RequestInit;
    expect(opts.method).toBe('PUT');
    expect(JSON.parse(opts.body as string)).toEqual({ autoApprove: false });
  });

  it('getPreview GETs /outreach/preview', async () => {
    fetchMock.mockReturnValue(okJson([{ venueId: 'c1', venueName: 'Venue A', subject: 'S', body: 'B' }]));
    const previews = await outreachUtils.getPreview('tok', ['c1', 'c2'], 'Aug 14');
    expect(previews).toHaveLength(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/outreach/preview?venueIds=c1,c2&targetDates=Aug%2014');
  });

  it('getPendingReplies GETs /outreach/replies/pending', async () => {
    fetchMock.mockReturnValue(okJson([{ _id: 'o1', status: 'replied' }]));
    const replies = await outreachUtils.getPendingReplies('tok');
    expect(replies).toHaveLength(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/outreach/replies/pending');
  });

  it('applySuggestion POSTs the suggestion update payload', async () => {
    fetchMock.mockReturnValue(okJson({ _id: 'o1', status: 'replied' }));
    const res = await outreachUtils.applySuggestion('tok', 'id1', { bookingStatus: 'booking', interested: true });
    expect(res).toBeDefined();
    const opts = fetchMock.mock.calls[0][1] as RequestInit;
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body as string)).toEqual({ bookingStatus: 'booking', interested: true });
    expect(fetchMock.mock.calls[0][0]).toContain('/outreach/id1/apply-suggestion');
  });

  it('deleteOutreach DELETEs /outreach/:id', async () => {
    fetchMock.mockReturnValue(okJson({}));
    await outreachUtils.deleteOutreach('tok', 'id1');
    const opts = fetchMock.mock.calls[0][1] as RequestInit;
    expect(opts.method).toBe('DELETE');
    expect(fetchMock.mock.calls[0][0]).toContain('/outreach/id1');
  });

  it('recordOutcome POSTs the outcome payload', async () => {
    fetchMock.mockReturnValue(okJson({}));
    const res = await outreachUtils.recordOutcome('tok', 'id1', { status: 'interested' });
    expect(res).toBeDefined();
    const opts = fetchMock.mock.calls[0][1] as RequestInit;
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body as string)).toEqual({ status: 'interested' });
    expect(fetchMock.mock.calls[0][0]).toContain('/outreach/id1/outcome');
  });

  it('listOutreach GETs /outreach with optional queries', async () => {
    fetchMock.mockReturnValue(okJson([{ _id: 'o1' }]));
    const res = await outreachUtils.listOutreach('tok', { venueId: 'v1', status: 'replied' });
    expect(res).toHaveLength(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/outreach?venueId=v1&status=replied');
  });

  it('listOutreach GETs /outreach without queries', async () => {
    fetchMock.mockReturnValue(okJson([]));
    await outreachUtils.listOutreach('tok');
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/outreach$/);
  });

  it.each([
    ['getCandidates', () => outreachUtils.getCandidates('t', 'd')],
    ['sendBatch', () => outreachUtils.sendBatch('t', { venueIds: ['a'], targetDates: 'd' })],
    ['getConfig', () => outreachUtils.getConfig('t')],
    ['setConfig', () => outreachUtils.setConfig('t', true)],
    ['getPreview', () => outreachUtils.getPreview('t', ['a'], 'd')],
    ['getPendingReplies', () => outreachUtils.getPendingReplies('t')],
    ['applySuggestion', () => outreachUtils.applySuggestion('t', 'id', {})],
    ['deleteOutreach', () => outreachUtils.deleteOutreach('t', 'id')],
    ['recordOutcome', () => outreachUtils.recordOutcome('t', 'id', { status: 'interested' })],
    ['listOutreach', () => outreachUtils.listOutreach('t')],
  ])('%s throws on a non-ok response', async (_name, call) => {
    fetchMock.mockReturnValue(failed());
    await expect(call()).rejects.toThrow('500');
  });
});
