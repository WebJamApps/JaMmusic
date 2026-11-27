import { act, renderHook } from '@testing-library/react';
import { customFetch } from 'src/lib/fetch.utils';
import {
  addressFields,
  formatListingOption,
  useAddressLookup,
  type VenueListingSuggestion,
} from 'src/containers/AdminVenues/venue-address-lookup';

vi.mock('src/lib/fetch.utils', () => ({ customFetch: vi.fn() }));

const suggestions: VenueListingSuggestion[] = [
  {
    listingId: 'listing-1',
    name: 'Durty Bull Brewing',
    street: '206 Broadway St',
    city: 'Durham',
    state: 'NC',
    zipCode: '27701',
    website: 'https://durtybull.com',
    lat: 36.001,
    lng: -78.902,
  },
];

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const fetchMock = vi.mocked(customFetch);

async function tick() { await act(async () => { await vi.advanceTimersByTimeAsync(300); }); }
function deferred() {
  let resolve!: (value: Response) => void;
  const promise = new Promise<Response>((done) => { resolve = done; });
  return { promise, resolve };
}

describe('shared backend listings venue lookup', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    vi.stubEnv('BackendUrl', '');
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(response(suggestions));
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

  it('formats listing options with name, street and city', () => {
    expect(formatListingOption(suggestions[0])).toBe('Durty Bull Brewing — 206 Broadway St, Durham');
    expect(formatListingOption({ ...suggestions[0], street: '', city: '' })).toBe('Durty Bull Brewing');
  });

  it('debounces, skips queries under two characters, authenticates, and selects without a second request', async () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useAddressLookup(true, 'admin-token', onSelect));
    act(() => { result.current.search('D'); });
    await tick();
    expect(fetchMock).not.toHaveBeenCalled();

    act(() => { result.current.search('Du'); result.current.search('Durty Bull'); });
    expect(fetchMock).not.toHaveBeenCalled();
    await tick();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [firstUrl, init] = fetchMock.mock.calls[0];
    const first = new URL(String(firstUrl), 'http://local');
    expect(first.pathname).toBe('/venue/listings/search');
    expect(first.searchParams.get('q')).toBe('Durty Bull');
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer admin-token' });

    act(() => { result.current.select(suggestions[0]); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(suggestions[0]);
    expect(result.current.suggestions).toEqual([]);
  });

  it('shows a not-loaded message when listings search returns 503', async () => {
    fetchMock.mockResolvedValueOnce(response({ message: 'Venue listings have not loaded yet' }, 503));
    const onSelect = vi.fn();
    const { result } = renderHook(() => useAddressLookup(true, 'tk', onSelect));
    act(() => result.current.search('Manual venue'));
    await tick();
    expect(result.current.message).toContain('Venue listings have not loaded yet');
    expect(result.current.message).toContain('manually');
    expect(result.current.loading).toBe(false);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it.each([502, 429, 403, 401])('allows typed fallback when listings search returns %s', async (status) => {
    fetchMock.mockResolvedValueOnce(response({ message: 'Address lookup is unavailable' }, status));
    const onSelect = vi.fn();
    const { result } = renderHook(() => useAddressLookup(true, 'tk', onSelect));
    act(() => result.current.search('Manual venue'));
    await tick();
    expect(result.current.message).toContain('Address lookup unavailable');
    expect(result.current.message).toContain('manually');
    expect(result.current.loading).toBe(false);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it.each([{ body: [] }, { body: { unexpected: true } }, { body: [{ listingId: 7, name: 'bad' }] }])(
    'handles empty or malformed listings: %j',
    async ({ body }) => {
      fetchMock.mockResolvedValueOnce(response(body));
      const { result } = renderHook(() => useAddressLookup(true, 'tk', vi.fn()));
      act(() => result.current.search('123'));
      await tick();
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.message).toContain('manually');
    },
  );

  it('ignores an older listing response even before the newer debounce fires', async () => {
    const old = deferred();
    fetchMock.mockReturnValueOnce(old.promise);
    const { result } = renderHook(() => useAddressLookup(true, 'tk', vi.fn()));
    act(() => result.current.search('Old'));
    await tick();
    act(() => result.current.search('New'));
    await act(async () => old.resolve(response([{ ...suggestions[0], listingId: 'old', name: 'Old Venue' }])));
    expect(result.current.suggestions).toEqual([]);
    await tick();
    expect(result.current.suggestions).toEqual(suggestions);
  });

  it('cancels queued searches and late responses on a manual edit', async () => {
    const { result } = renderHook(() => useAddressLookup(true, 'tk', vi.fn()));
    act(() => { result.current.search('Cancelled'); result.current.invalidate(); });
    await tick();
    expect(fetchMock).not.toHaveBeenCalled();

    const pending = deferred();
    fetchMock.mockReturnValueOnce(pending.promise);
    act(() => result.current.search('Durty'));
    await tick();
    act(() => result.current.invalidate());
    await act(async () => pending.resolve(response(suggestions)));
    expect(result.current.suggestions).toEqual([]);
  });

  it.each(['close', 'token', 'unmount'])('discards pending results on %s', async (change) => {
    const pending = deferred();
    fetchMock.mockReturnValueOnce(pending.promise);
    const onSelect = vi.fn();
    const { result, rerender, unmount } = renderHook(
      ({ open, token }) => useAddressLookup(open, token, onSelect),
      { initialProps: { open: true, token: 'tk' } },
    );
    act(() => result.current.search('Durty'));
    await tick();
    if (change === 'unmount') unmount();
    else rerender({ open: change !== 'close', token: change === 'token' ? 'new' : 'tk' });
    await act(async () => pending.resolve(response(suggestions)));
    expect(result.current.suggestions).toEqual([]);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('handles network rejection and whitespace searches without filling fields', async () => {
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => useAddressLookup(true, 'tk', vi.fn()));
    act(() => result.current.search('   '));
    await tick();
    expect(fetchMock).not.toHaveBeenCalled();
    act(() => result.current.search('Durty'));
    await tick();
    expect(result.current.message).toContain('manually');
  });
});

describe('selected listing mapping', () => {
  it('maps name, address, state, coordinates, empty website, and strips the ZIP extension', () => {
    expect(addressFields({
      name: 'Slow Play',
      street: '123 Main',
      city: 'Salem',
      state: 'VA',
      zipCode: '24153-1234',
      website: 'https://slowplay.example',
      lat: 37.27,
      lng: -79.94,
    }, { website: '' })).toMatchObject({
      name: 'Slow Play',
      address: '123 Main',
      city: 'Salem',
      usState: 'VA',
      zipCode: '24153',
      website: 'https://slowplay.example',
      location: { type: 'Point', coordinates: [-79.94, 37.27] },
    });
  });

  it('keeps an already typed website as typed', () => {
    expect(addressFields({
      name: 'Slow Play',
      street: '123 Main',
      city: 'Salem',
      state: 'VA',
      zipCode: '24153',
      website: 'https://listing.example',
      lat: 37.27,
      lng: -79.94,
    }, { website: 'https://typed.example' })).toMatchObject({
      website: 'https://typed.example',
    });
  });

  it('retains existing manual parts when listing omits components', () => {
    expect(addressFields({ street: '456 Yonge', state: 'ON' }, {
      country: 'CA', city: 'Manual city', zipCode: 'M1A 1A1',
    })).toMatchObject({
      address: '456 Yonge', country: 'CA', region: 'ON', usState: '', city: 'Manual city', zipCode: 'M1A 1A1',
    });
    expect(addressFields({}, { address: 'Manual', region: 'Keep', country: 'CA' }))
      .toMatchObject({ address: 'Manual', region: 'Keep' });
  });

  it.each([
    { lat: 91, lng: 0 },
    { lat: 0, lng: -181 },
    { lat: Number.NaN, lng: 1 },
    { lat: 0, lng: 0 },
    {},
  ])('omits invalid or missing coordinates %j', (place) => {
    expect(addressFields(place, {}).location).toBeUndefined();
  });
});
