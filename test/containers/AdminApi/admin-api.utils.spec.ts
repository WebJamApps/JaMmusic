import adminApiUtils from 'src/containers/AdminApi/admin-api.utils';

const okJson = (data: unknown) => Promise.resolve({
  ok: true,
  status: 200,
  json: () => Promise.resolve(data),
} as Response);

const failed = () => Promise.resolve({
  ok: false,
  status: 403,
  statusText: 'Forbidden',
} as Response);

describe('AdminApi utils', () => {
  describe('getAllowedAdminRoles', () => {
    it('returns JaM-admin and Developer', () => {
      expect(adminApiUtils.getAllowedAdminRoles()).toEqual(['JaM-admin', 'Developer']);
    });
  });

  describe('getOpenApiUrl', () => {
    it('returns the endpoint path for openapi.json', () => {
      const url = adminApiUtils.getOpenApiUrl();
      expect(url).toContain('/openapi.json');
    });
  });

  describe('fetchOpenApi', () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      fetchMock = vi.fn();
      global.fetch = fetchMock as unknown as typeof fetch;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('fetches /openapi.json with the admin token and returns the parsed spec', async () => {
      const mockSpec = { openapi: '3.1.0', info: { title: 'web-jam-back API' }, paths: {} };
      fetchMock.mockReturnValue(okJson(mockSpec));

      const spec = await adminApiUtils.fetchOpenApi('admin-token-123');
      expect(spec).toEqual(mockSpec);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toContain('/openapi.json');
      expect((opts as RequestInit).headers).toMatchObject({
        Accept: 'application/json',
        Authorization: 'Bearer admin-token-123',
      });
    });

    it('throws error when the response is not ok', async () => {
      fetchMock.mockReturnValue(failed());
      await expect(adminApiUtils.fetchOpenApi('admin-token-123')).rejects.toThrow('403 Forbidden');
    });
  });
});
