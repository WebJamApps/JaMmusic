import { webcrypto, createHash } from 'node:crypto';
import outreachUtils from 'src/containers/AdminOutreach/outreach.utils';
import { dispatchApprovedBatch, fingerprintDraft } from 'src/containers/AdminOutreach/outreach.utils';

const okJson = (data: unknown) => Promise.resolve({ ok: true, json: () => Promise.resolve(data) } as Response);
const failed = () => Promise.resolve(new Response('', { status: 500, statusText: 'Server Error' }));

describe('Outreach utils', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => { vi.stubGlobal('crypto', webcrypto); fetchMock = vi.fn(); global.fetch = fetchMock as unknown as typeof fetch; });
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

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

  it('sendBatch POSTs only the checked dispatch id', async () => {
    fetchMock.mockReturnValue(okJson({ requested: 2, sent: 2, skipped: [], records: [] }));
    const res = await outreachUtils.sendBatch('tok', { dispatchId: 'checked-dispatch' });
    expect(res.sent).toBe(2);
    const opts = fetchMock.mock.calls[0][1] as RequestInit;
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body as string)).toEqual({ dispatchId: 'checked-dispatch' });
  });

  it('getPreview GETs /outreach/preview', async () => {
    fetchMock.mockReturnValue(okJson([{ venueId: 'c1', venueName: 'Venue A', subject: 'S', body: 'B' }]));
    const previews = await outreachUtils.getPreview('tok', ['c1'], 'Aug 14');
    expect(previews).toHaveLength(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/outreach/preview?venueIds=c1&targetDates=Aug%2014');
  });

  it('getPendingReplies GETs /outreach/replies/pending', async () => {
    fetchMock.mockReturnValue(okJson([{ _id: 'o1', status: 'replied' }]));
    const replies = await outreachUtils.getPendingReplies('tok');
    expect(replies).toHaveLength(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/outreach/replies/pending');
  });

  it('applySuggestion POSTs the suggestion update payload', async () => {
    fetchMock.mockReturnValue(okJson({ _id: 'o1', status: 'replied' }));
    const res = await outreachUtils.applySuggestion('tok', 'id1', { bookingStatus: 'booking' });
    expect(res).toBeDefined();
    const opts = fetchMock.mock.calls[0][1] as RequestInit;
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body as string)).toEqual({ bookingStatus: 'booking' });
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

  it('recordOutcome POSTs target-filled outcome with targetWeekend (web-jam-back#1117)', async () => {
    fetchMock.mockReturnValue(okJson({}));
    const res = await outreachUtils.recordOutcome('tok', 'id1', {
      status: 'target-filled',
      targetWeekend: { start: '2026-08-14', end: '2026-08-16' },
    });
    expect(res).toBeDefined();
    const opts = fetchMock.mock.calls[0][1] as RequestInit;
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body as string)).toEqual({
      status: 'target-filled',
      targetWeekend: { start: '2026-08-14', end: '2026-08-16' },
    });
    expect(fetchMock.mock.calls[0][0]).toContain('/outreach/id1/outcome');
  });

  it('listOutreach GETs /outreach with optional queries', async () => {
    fetchMock.mockReturnValue(okJson([{ _id: 'o1' }]));
    const res = await outreachUtils.listOutreach('tok', { venueId: 'v1', status: 'replied' });
    expect(res).toHaveLength(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/outreach?venueId=v1&status=replied');
  });

  it('listOutreach GETs /outreach with status=booked and status=target-filled (D-62)', async () => {
    fetchMock.mockReturnValue(okJson([{ _id: 'bk1', status: 'booked' }]));
    const booked = await outreachUtils.listOutreach('tok', { status: 'booked' });
    expect(booked).toHaveLength(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/outreach?status=booked');

    fetchMock.mockReturnValue(okJson([{ _id: 'tf1', status: 'target-filled' }]));
    const filled = await outreachUtils.listOutreach('tok', { status: 'target-filled' });
    expect(filled).toHaveLength(1);
    expect(fetchMock.mock.calls[1][0]).toContain('/outreach?status=target-filled');
  });

  it('listOutreach GETs /outreach without queries', async () => {
    fetchMock.mockReturnValue(okJson([]));
    await outreachUtils.listOutreach('tok');
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/outreach$/);
  });

  it('getReportIndex GETs /outreach/report with the admin token', async () => {
    const records = [
      {
        _id: 'r1', weekend: '2026-10-16-to-2026-10-18', title: 'Fall Run',
        candidatesCount: 12, dispatchedCount: 9, updated_at: '2026-09-05T00:00:00.000Z',
      },
    ];
    fetchMock.mockReturnValue(okJson(records));
    const res = await outreachUtils.getReportIndex('tok');
    expect(res).toEqual(records);
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/outreach\/report$/);
    const opts = fetchMock.mock.calls[0][1] as RequestInit;
    expect((opts.headers as Record<string, string>).Authorization).toBe('Bearer tok');
  });

    it.each([
    ['getCandidates', () => outreachUtils.getCandidates('t', 'd')],
    ['sendBatch', () => outreachUtils.sendBatch('t', { dispatchId: 'checked-dispatch' })],
    ['getPreview', () => outreachUtils.getPreview('t', ['a'], 'd')],
    ['getPendingReplies', () => outreachUtils.getPendingReplies('t')],
    ['applySuggestion', () => outreachUtils.applySuggestion('t', 'id', {})],
    ['deleteOutreach', () => outreachUtils.deleteOutreach('t', 'id')],
    ['recordOutcome', () => outreachUtils.recordOutcome('t', 'id', { status: 'interested' })],
    ['listOutreach', () => outreachUtils.listOutreach('t')],
    ['getReportIndex', () => outreachUtils.getReportIndex('t')],
  ])('%s throws on a non-ok response', async (_name, call) => {
    fetchMock.mockReturnValue(failed());
    await expect(call()).rejects.toThrow('500');
  });

  const batch = {
    batchId: '2027-03-19-to-2027-03-21', venueIds: ['a', 'b'], targetDates: 'March 19-21',
    bookingPeriod: 'spring 2027', targetWeekend: { start: '2027-03-19', end: '2027-03-21' },
  };
  const drafts = ['a', 'b'].map(venueId => ({ venueId, venueName: venueId, subject: `Subject ${venueId}`, body: `<p>${venueId}</p>` }));

  it('looks up a prior approval and treats only HTTP 404 as absent', async () => {
    fetchMock.mockResolvedValueOnce(new Response('', { status: 404 }));
    expect(await outreachUtils.getVenueApproval('tok', batch.batchId)).toBeNull();
    fetchMock.mockReturnValueOnce(okJson({ batchId: batch.batchId, venueIds: ['a'], approver: 'Josh' }));
    expect(await outreachUtils.getVenueApproval('tok', batch.batchId)).toMatchObject({ venueIds: ['a'] });
    fetchMock.mockResolvedValueOnce(Response.json({ message: 'Approval store unavailable' }, { status: 503 }));
    await expect(outreachUtils.getVenueApproval('tok', batch.batchId)).rejects.toThrow('Approval store unavailable');
    fetchMock.mockReturnValueOnce(okJson({ venueIds: null }));
    await expect(outreachUtils.getVenueApproval('tok', batch.batchId)).rejects.toThrow('Could not read');
  });

  it('records the approved venues with Josh as approver', async () => {
    fetchMock.mockReturnValue(okJson({}));
    await outreachUtils.approveVenues('tok', batch);
    expect(fetchMock.mock.calls[0][0]).toContain('/approval/gate1');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ ...batch, approver: 'Josh' });
  });

  it('hashes exactly subject + blank line + body with the server trimming contract', async () => {
    const preview = { ...drafts[0], subject: ' Subject ', body: ' <p>Email & footer</p> ' };
    const result = await fingerprintDraft(preview);
    expect(result.fingerprint).toBe(createHash('sha256').update('Subject\n\n<p>Email & footer</p>').digest('hex'));
    expect((await fingerprintDraft({ ...preview, subject: 'Changed subject' })).fingerprint).not.toBe(result.fingerprint);
  });

  it.each([[], [drafts[0]], [drafts[0], drafts[0]], [drafts[0], { ...drafts[1], body: '' }], [null]].map(previews => ({ previews })))(
    'refuses incomplete or malformed previews (%j)', async ({ previews }) => {
      fetchMock.mockReturnValue(okJson(previews));
      await expect(outreachUtils.getPreview('tok', ['a', 'b'], 'March 19-21', 'spring 2027')).rejects.toThrow();
    },
  );

  it('records Gate 2 before preflight, then sends sequential chunks with only the dispatch id', async () => {
    fetchMock.mockReturnValueOnce(okJson({}));
    fetchMock.mockReturnValueOnce(okJson({ dispatchId: 'dispatch', venueCount: 2 }));
    fetchMock.mockReturnValueOnce(okJson({ sent: 1, skipped: [], records: ['first'], remaining: 1 }));
    fetchMock.mockReturnValueOnce(okJson({ sent: 0, skipped: [{ venueId: 'b', venueName: 'B', reason: 'On hold' }], records: [], remaining: 0 }));
    const progress = vi.fn();
    const result = await dispatchApprovedBatch('tok', batch, drafts, progress);
    expect(fetchMock.mock.calls.map(call => String(call[0]).split('/outreach/')[1])).toEqual([
      'approval/gate2', 'batch/preflight', 'batch', 'batch',
    ]);
    const approval = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(approval).toMatchObject({ ...batch, approver: 'Josh' });
    expect(approval.draftFingerprints).toEqual(await Promise.all(drafts.map(draft => fingerprintDraft(draft))));
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual({ dispatchId: 'dispatch' });
    expect(JSON.parse(fetchMock.mock.calls[3][1].body)).toEqual({ dispatchId: 'dispatch' });
    expect(result).toMatchObject({ requested: 2, sent: 1, remaining: 0, skipped: [{ reason: 'On hold' }] });
    expect(progress).toHaveBeenCalledTimes(2);
    expect(progress.mock.calls[0][0]).toMatchObject({ sent: 1, remaining: 1 });
  });

  it.each(['approval/gate2', 'batch/preflight', 'batch'])('stops on a refusal from %s with its exact message', async path => {
    if (path !== 'approval/gate2') fetchMock.mockReturnValueOnce(okJson({}));
    if (path === 'batch') fetchMock.mockReturnValueOnce(okJson({ dispatchId: 'dispatch', venueCount: 2 }));
    fetchMock.mockResolvedValueOnce(Response.json({ message: 'Gate approval changed; review the emails again' }, { status: 403 }));
    await expect(dispatchApprovedBatch('tok', batch, drafts, vi.fn())).rejects.toThrow('Gate approval changed; review the emails again');
    expect(fetchMock.mock.calls.at(-1)?.[0]).toContain(path);
  });

  it.each([
    { sent: 0, skipped: [], records: [], remaining: 2 },
    { sent: 0, skipped: [], records: [], remaining: -1 },
    { sent: 3, skipped: [], records: [], remaining: 0 },
    { sent: 0, skipped: null, records: [], remaining: 0 },
    { sent: 1, skipped: [], records: [], remaining: 1, stopped: { venueId: 'b', venueName: 'B', reason: 'Mailbox unavailable' } },
  ])('halts without retrying a stalled, invalid or paused dispatch (%j)', async chunk => {
    fetchMock.mockReturnValueOnce(okJson({}));
    fetchMock.mockReturnValueOnce(okJson({ dispatchId: 'dispatch', venueCount: 2 }));
    fetchMock.mockReturnValueOnce(okJson(chunk));
    await expect(dispatchApprovedBatch('tok', batch, drafts, vi.fn())).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('stops before recording approval if any preview is missing', async () => {
    await expect(dispatchApprovedBatch('tok', batch, [], vi.fn())).rejects.toThrow('Every email');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refuses an invalid preflight result without sending', async () => {
    fetchMock.mockReturnValueOnce(okJson({}));
    fetchMock.mockReturnValueOnce(okJson({ dispatchId: '', venueCount: 2 }));
    await expect(dispatchApprovedBatch('tok', batch, drafts, vi.fn())).rejects.toThrow('no valid dispatch');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('shows a plain-text refusal verbatim', async () => {
    fetchMock.mockResolvedValue(new Response('Gateway refused this request', { status: 502 }));
    await expect(outreachUtils.approveVenues('tok', batch)).rejects.toThrow('Gateway refused this request');
  });

  it('triggers auth:logout event on 401 response', async () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    fetchMock.mockReturnValue(Promise.resolve(new Response('', { status: 401, statusText: 'Unauthorized' })));
    await expect(outreachUtils.getCandidates('bad-tok')).rejects.toThrow('401');
    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'auth:logout' }));
  });
});
