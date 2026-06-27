import adminTemplatesUtils, { type Itemplate, exportToCSV, parseCSV } from 'src/containers/AdminTemplates/admin-templates.utils';

const okJson = (data: unknown) => Promise.resolve({ ok: true, json: () => Promise.resolve(data) } as Response);
const okBlob = (blobData: Blob) => Promise.resolve({ ok: true, blob: () => Promise.resolve(blobData) } as Response);
const failed = () => Promise.resolve({ ok: false, status: 500, statusText: 'Server Error' } as Response);

describe('AdminTemplates utils', () => {
  describe('fetch-backed API calls', () => {
    let fetchMock: ReturnType<typeof vi.fn>;
    beforeEach(() => {
      fetchMock = vi.fn();
      global.fetch = fetchMock as unknown as typeof fetch;
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('listTemplates GETs with a bearer token, active filter, and returns templates', async () => {
      fetchMock.mockReturnValue(okJson([{ _id: '1', type: 'Originals', stage: 'cold', subject: 'hi' }]));
      const templates = await adminTemplatesUtils.listTemplates('tok', { type: 'Originals', stage: 'cold', active: true });
      expect(templates).toHaveLength(1);
      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toContain('/template');
      expect(url).toContain('type=Originals');
      expect(url).toContain('stage=cold');
      expect(url).toContain('active=true');
      expect((opts as RequestInit).headers).toMatchObject({ Authorization: 'Bearer tok' });
    });

    it('getTemplate GETs a specific template by id', async () => {
      fetchMock.mockReturnValue(okJson({ _id: '123', type: 'OnlineForm' }));
      const t = await adminTemplatesUtils.getTemplate('tok', '123');
      expect(t.type).toBe('OnlineForm');
      expect(fetchMock.mock.calls[0][0]).toContain('/template/123');
    });

    it('createTemplate POSTs the template data', async () => {
      fetchMock.mockReturnValue(okJson({ _id: 'new', type: 'PubFestivalBrewery' }));
      const payload: Partial<Itemplate> = { type: 'PubFestivalBrewery', stage: 'cold', subject: 'Inquiry' };
      const t = await adminTemplatesUtils.createTemplate('tok', payload);
      expect(t._id).toBe('new');
      const opts = fetchMock.mock.calls[0][1] as RequestInit;
      expect(opts.method).toBe('POST');
      expect(JSON.parse(opts.body as string)).toMatchObject({ type: 'PubFestivalBrewery' });
    });

    it('updateTemplate PUTs template modifications', async () => {
      fetchMock.mockReturnValue(okJson({ _id: '1', subject: 'Updated' }));
      const t = await adminTemplatesUtils.updateTemplate('tok', '1', { subject: 'Updated' });
      expect(t.subject).toBe('Updated');
      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toContain('/template/1');
      expect((opts as RequestInit).method).toBe('PUT');
    });

    it('deleteTemplate DELETEs the template by id', async () => {
      fetchMock.mockReturnValue(okJson({}));
      await adminTemplatesUtils.deleteTemplate('tok', '1');
      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toContain('/template/1');
      expect((opts as RequestInit).method).toBe('DELETE');
    });

    it('getTemplateAssetUrl requests the asset and builds an object URL', async () => {
      const mockBlob = new Blob(['foo'], { type: 'image/jpeg' });
      fetchMock.mockReturnValue(okBlob(mockBlob));
      const url = await adminTemplatesUtils.getTemplateAssetUrl('tok', 'template-123');
      expect(url).toBe('blob:mock-url');
      expect(fetchMock.mock.calls[0][0]).toContain('/template/assets/template-123');
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    });

    it.each([
      ['listTemplates', () => adminTemplatesUtils.listTemplates('t')],
      ['getTemplate', () => adminTemplatesUtils.getTemplate('t', '1')],
      ['createTemplate', () => adminTemplatesUtils.createTemplate('t', { type: 'Originals' })],
      ['updateTemplate', () => adminTemplatesUtils.updateTemplate('t', '1', {})],
      ['deleteTemplate', () => adminTemplatesUtils.deleteTemplate('t', '1')],
      ['getTemplateAssetUrl', () => adminTemplatesUtils.getTemplateAssetUrl('t', 'ref')],
    ])('%s throws on a non-ok response', async (_name, call) => {
      fetchMock.mockReturnValue(failed());
      await expect(call()).rejects.toThrow('500');
    });
  });

  describe('CSV parsing and exporting', () => {
    const sampleTemplates: Itemplate[] = [
      { type: 'Originals', stage: 'cold', subject: 'Subject, with comma', bodyHtml: 'Hello "World"\nLine 2', footerPhotoRef: 'ref-1', active: true },
      { type: 'MidRangeCafeBar', stage: 'returning', subject: 'Subject2', bodyHtml: 'Plain', footerPhotoRef: '', active: false },
    ];

    it('roundtrips a CSV export and import successfully', () => {
      const csv = exportToCSV(sampleTemplates);
      expect(csv).toContain('Originals');
      expect(csv).toContain('"Subject, with comma"');
      expect(csv).toContain('Hello ""World""');

      const parsed = parseCSV(csv);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].type).toBe('Originals');
      expect(parsed[0].stage).toBe('cold');
      expect(parsed[0].subject).toBe('Subject, with comma');
      expect(parsed[0].bodyHtml).toBe('Hello "World"\nLine 2');
      expect(parsed[0].footerPhotoRef).toBe('ref-1');
      expect(parsed[0].active).toBe('true');

      expect(parsed[1].type).toBe('MidRangeCafeBar');
      expect(parsed[1].stage).toBe('returning');
      expect(parsed[1].subject).toBe('Subject2');
      expect(parsed[1].bodyHtml).toBe('Plain');
      expect(parsed[1].footerPhotoRef).toBe('');
      expect(parsed[1].active).toBe('false');
    });

    it('returns empty array when CSV has no data rows', () => {
      expect(parseCSV('')).toEqual([]);
      expect(parseCSV('type,stage\n')).toEqual([]);
    });
  });
});
