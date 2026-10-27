import { act, renderHook } from '@testing-library/react';
import { customFetch } from 'src/lib/fetch.utils';
import { addressFields, useAddressLookup } from 'src/containers/AdminVenues/venue-address-lookup';

vi.mock('src/lib/fetch.utils', () => ({ customFetch: vi.fn() }));
const suggestions = [{ placeId: 'place/1', text: '123 Main St' }];
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const fetchMock = vi.mocked(customFetch);

async function tick() { await act(async () => { await vi.advanceTimersByTimeAsync(300); }); }
function deferred() {
  let resolve!: (value: Response) => void;
  const promise = new Promise<Response>((done) => { resolve = done; });
  return { promise, resolve };
}

describe('shared backend address lookup', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    vi.stubEnv('BackendUrl', '');
    fetchMock.mockResolvedValue(response(suggestions));
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

  it('debounces, authenticates, and uses the same token until selection', async () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useAddressLookup(true, 'admin-token', onSelect));
    act(() => { result.current.search('1', 'US'); result.current.search('123 Main', 'US'); });
    expect(fetchMock).not.toHaveBeenCalled();
    await tick();
    const [firstUrl, init] = fetchMock.mock.calls[0];
    const first = new URL(String(firstUrl), 'http://local');
    expect(first.pathname).toBe('/venue/places/suggest');
    expect(first.searchParams.get('input')).toBe('123 Main');
    expect(first.searchParams.get('regionCode')).toBe('us');
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer admin-token' });
    const session = first.searchParams.get('sessionToken');
    expect(session).toMatch(/^[\da-f-]{36}$/i);
    act(() => { result.current.search('123 Main St', 'US'); });
    await tick();
    expect(String(fetchMock.mock.calls[1][0])).toContain(`sessionToken=${session}`);
    fetchMock.mockResolvedValueOnce(response({ street: '123 Main St', lat: 1, lng: 2 }));
    await act(async () => { await result.current.select(suggestions[0]); });
    expect(String(fetchMock.mock.calls[2][0])).toContain(`place%2F1?sessionToken=${session}`);
    expect(onSelect).toHaveBeenCalledWith({ street: '123 Main St', lat: 1, lng: 2 });
    act(() => { result.current.search('4 New', 'CA'); });
    await tick();
    expect(new URL(String(fetchMock.mock.calls[3][0]), 'http://local').searchParams.get('sessionToken')).not.toBe(session);
  });

  it.each([503, 502, 429, 403])('allows typed fallback when suggestions return %s', async (status) => {
    fetchMock.mockResolvedValueOnce(response({ message: 'Address lookup is not configured' }, status));
    const onSelect = vi.fn();
    const { result } = renderHook(() => useAddressLookup(true, 'tk', onSelect));
    act(() => result.current.search('Manual address', 'US'));
    await tick();
    expect(result.current.message).toContain('enter the address manually');
    expect(result.current.loading).toBe(false);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it.each([{ body: [] }, { body: { unexpected: true } }, { body: [{ placeId: 7, text: 'bad' }] }])(
    'handles empty or malformed suggestions: %j', async ({ body }) => {
    fetchMock.mockResolvedValueOnce(response(body));
    const { result } = renderHook(() => useAddressLookup(true, 'tk', vi.fn()));
    act(() => result.current.search('123', 'US'));
    await tick();
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.message).toContain('manually');
  });

  it('ignores an older suggestion even before the newer debounce fires', async () => {
    const old = deferred();
    fetchMock.mockReturnValueOnce(old.promise);
    const { result } = renderHook(() => useAddressLookup(true, 'tk', vi.fn()));
    act(() => result.current.search('Old', 'US'));
    await tick();
    act(() => result.current.search('New', 'US'));
    await act(async () => old.resolve(response([{ placeId: 'old', text: 'Old address' }])));
    expect(result.current.suggestions).toEqual([]);
    await tick();
    expect(result.current.suggestions).toEqual(suggestions);
  });

  it('cancels both queued searches and late details on a manual edit', async () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useAddressLookup(true, 'tk', onSelect));
    act(() => { result.current.search('Cancelled', 'US'); result.current.invalidate(); });
    await tick();
    expect(fetchMock).not.toHaveBeenCalled();
    act(() => result.current.search('123 Main', 'US'));
    await tick();
    const details = deferred();
    fetchMock.mockReturnValueOnce(details.promise);
    let selected!: Promise<void>;
    act(() => { selected = result.current.select(suggestions[0]); });
    act(() => result.current.invalidate());
    await act(async () => { details.resolve(response({ street: 'Late street' })); await selected; });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it.each(['close', 'token', 'unmount'])('discards pending results on %s', async (change) => {
    const pending = deferred();
    fetchMock.mockReturnValueOnce(pending.promise);
    const onSelect = vi.fn();
    const { result, rerender, unmount } = renderHook(({ open, token }) => useAddressLookup(open, token, onSelect), {
      initialProps: { open: true, token: 'tk' },
    });
    act(() => result.current.search('123', 'US'));
    await tick();
    if (change === 'unmount') unmount();
    else rerender({ open: change !== 'close', token: change === 'token' ? 'new' : 'tk' });
    await act(async () => pending.resolve(response(suggestions)));
    expect(result.current.suggestions).toEqual([]);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it.each([null, [], { street: 42 }])('rejects malformed details: %j', async (details) => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useAddressLookup(true, 'tk', onSelect));
    act(() => result.current.search('123', 'US'));
    await tick();
    fetchMock.mockResolvedValueOnce(response(details));
    await act(async () => result.current.select(suggestions[0]));
    expect(result.current.message).toContain('manually');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('handles network rejection and empty searches without filling fields', async () => {
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => useAddressLookup(true, 'tk', vi.fn()));
    act(() => result.current.search(' ', 'US'));
    await tick();
    expect(fetchMock).not.toHaveBeenCalled();
    act(() => result.current.search('123', 'US'));
    await tick();
    expect(result.current.message).toContain('manually');
  });
});

describe('selected address mapping', () => {
  it('maps exact coordinates and strips the ZIP extension', () => {
    expect(addressFields({ street: '123 Main', city: 'Salem', country: 'US', state: 'VA', zipCode: '24153-1234', lat: 0, lng: 0 }, {}))
      .toMatchObject({ address: '123 Main', city: 'Salem', usState: 'VA', zipCode: '24153', location: { type: 'Point', coordinates: [0, 0] } });
  });
  it('maps international regions without inventing missing components', () => {
    expect(addressFields({ street: '456 Yonge', country: 'CA', state: 'ON' }, { city: 'Manual city', zipCode: 'M1A 1A1' }))
      .toMatchObject({ address: '456 Yonge', country: 'CA', region: 'ON', usState: '', city: 'Manual city', zipCode: 'M1A 1A1' });
    expect(addressFields({}, { address: 'Manual', region: 'Keep', country: 'CA' })).toMatchObject({ address: 'Manual', region: 'Keep' });
  });
  it.each([{ lat: 91, lng: 0 }, { lat: 0, lng: -181 }, { lat: Number.NaN, lng: 1 }, {}])('omits invalid or missing coordinates %j', (place) => {
    expect(addressFields(place, {}).location).toBeUndefined();
  });
});
