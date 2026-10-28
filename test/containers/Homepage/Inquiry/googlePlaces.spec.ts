import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchPlaceAddress,
  fetchSuggestions,
  loadGoogleMapsScript,
  resetGoogleMapsScriptPromise,
  UNAVAILABLE_NOTE,
  withTimeout,
} from 'src/containers/Homepage/Inquiry/googlePlaces';

describe('googlePlaces', () => {
  beforeEach(() => {
    resetGoogleMapsScriptPromise();
    document.querySelectorAll('script[src*="maps.googleapis.com"]').forEach((s) => s.remove());
    delete (window as unknown as Record<string, unknown>).__googleMapsCallback;
    delete (window as unknown as Record<string, unknown>).google;
  });

  afterEach(() => {
    resetGoogleMapsScriptPromise();
    document.querySelectorAll('script[src*="maps.googleapis.com"]').forEach((s) => s.remove());
    delete (window as unknown as Record<string, unknown>).__googleMapsCallback;
    delete (window as unknown as Record<string, unknown>).google;
    vi.restoreAllMocks();
  });

  it('exposes UNAVAILABLE_NOTE constant', () => {
    expect(UNAVAILABLE_NOTE).toBe(
      "Address suggestions are unavailable. Type the venue's full street address.",
    );
  });

  it('resolves immediately if google.maps.places is already defined', async () => {
    (window as unknown as { google: unknown }).google = {
      maps: { places: {} },
    };
    await expect(loadGoogleMapsScript('test-api-key')).resolves.toBeUndefined();
    expect(document.querySelector('script[src*="maps.googleapis.com"]')).toBeNull();
  });

  it('resolves immediately if google.maps.importLibrary is already defined', async () => {
    (window as unknown as { google: unknown }).google = {
      maps: { importLibrary: vi.fn() },
    };
    await expect(loadGoogleMapsScript('test-api-key')).resolves.toBeUndefined();
    expect(document.querySelector('script[src*="maps.googleapis.com"]')).toBeNull();
  });

  it('appends script with callback and resolves when callback is invoked', async () => {
    const promise = loadGoogleMapsScript('my-api-key');
    const script = document.querySelector('script[src*="maps.googleapis.com"]') as HTMLScriptElement;
    expect(script).not.toBeNull();
    expect(script.src).toContain('key=my-api-key');
    expect(script.src).toContain('libraries=places');

    const cb = (window as unknown as Record<string, () => void>).__googleMapsCallback;
    expect(typeof cb).toBe('function');
    cb();

    await expect(promise).resolves.toBeUndefined();
    expect((window as unknown as Record<string, unknown>).__googleMapsCallback).toBeUndefined();
  });

  it('reuses the same module-level promise for concurrent calls', () => {
    const p1 = loadGoogleMapsScript('key-1');
    const p2 = loadGoogleMapsScript('key-1');
    expect(p1).toBe(p2);
  });

  it('rejects on script error and cleans up callback', async () => {
    const promise = loadGoogleMapsScript('err-key');
    const script = document.querySelector('script[src*="maps.googleapis.com"]') as HTMLScriptElement;
    script.dispatchEvent(new Event('error'));

    await expect(promise).rejects.toThrow('Failed to load Google Maps script');
    expect((window as unknown as Record<string, unknown>).__googleMapsCallback).toBeUndefined();
  });

  it('rejects with timeout when script loading neither fires callback nor errors', async () => {
    vi.useFakeTimers();
    const promise = loadGoogleMapsScript('timeout-key', 50);
    vi.advanceTimersByTime(60);
    await expect(promise).rejects.toThrow('Google Maps script load timed out');
    vi.useRealTimers();
  });

  describe('fetchSuggestions', () => {
    it('throws when google.maps is not available', async () => {
      await expect(fetchSuggestions('123 Main')).rejects.toThrow('Google Maps unavailable');
    });

    it('uses importLibrary when available', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        suggestions: [
          {
            placePrediction: {
              placeId: 'pid-1',
              text: { toString: () => '123 Main St' },
            },
          },
          {
            placePrediction: {
              placeId: 'pid-2',
              text: '456 Elm St',
            },
          },
          {
            placePrediction: {
              placeId: 'pid-3',
              description: '789 Oak Ave',
            },
          },
          {
            placePrediction: {},
          },
        ],
      });

      (window as unknown as { google: unknown }).google = {
        maps: {
          importLibrary: vi.fn().mockResolvedValue({
            AutocompleteSuggestion: {
              fetchAutocompleteSuggestions: mockFetch,
            },
          }),
        },
      };

      const result = await fetchSuggestions('123 Main');
      expect(result).toEqual([
        { placeId: 'pid-1', description: '123 Main St' },
        { placeId: 'pid-2', description: '456 Elm St' },
        { placeId: 'pid-3', description: '789 Oak Ave' },
      ]);
    });

    it('falls back to AutocompleteService when importLibrary throws or is absent', async () => {
      const mockGetPlacePredictions = vi.fn((opts, cb) => {
        cb(
          [
            { place_id: 'legacy-1', description: 'Legacy 123 Main' },
            { place_id: 'legacy-2', description: 'Legacy 456 Elm' },
          ],
          'OK',
        );
      });

      class MockAutocompleteService {
        getPlacePredictions = mockGetPlacePredictions;
      }

      (window as unknown as { google: unknown }).google = {
        maps: {
          places: {
            PlacesServiceStatus: { OK: 'OK', ZERO_RESULTS: 'ZERO_RESULTS' },
            AutocompleteService: MockAutocompleteService,
          },
        },
      };

      const result = await fetchSuggestions('Legacy');
      expect(result).toEqual([
        { placeId: 'legacy-1', description: 'Legacy 123 Main' },
        { placeId: 'legacy-2', description: 'Legacy 456 Elm' },
      ]);
    });

    it('handles ZERO_RESULTS in AutocompleteService', async () => {
      class MockAutocompleteService {
        getPlacePredictions = vi.fn((opts, cb) => cb([], 'ZERO_RESULTS'));
      }

      (window as unknown as { google: unknown }).google = {
        maps: {
          places: {
            PlacesServiceStatus: { OK: 'OK', ZERO_RESULTS: 'ZERO_RESULTS' },
            AutocompleteService: MockAutocompleteService,
          },
        },
      };

      const result = await fetchSuggestions('No Match');
      expect(result).toEqual([]);
    });

    it('rejects on AutocompleteService error status', async () => {
      class MockAutocompleteService {
        getPlacePredictions = vi.fn((opts, cb) => cb(null, 'ERROR'));
      }

      (window as unknown as { google: unknown }).google = {
        maps: {
          places: {
            PlacesServiceStatus: { OK: 'OK', ZERO_RESULTS: 'ZERO_RESULTS' },
            AutocompleteService: MockAutocompleteService,
          },
        },
      };

      await expect(fetchSuggestions('Fail')).rejects.toThrow('Places autocomplete failed: ERROR');
    });

    it('rejects with timeout when fetchSuggestions neither resolves nor rejects', async () => {
      vi.useFakeTimers();
      (window as unknown as { google: unknown }).google = {
        maps: {
          importLibrary: vi.fn().mockImplementation(() => new Promise(() => {})),
        },
      };
      const promise = fetchSuggestions('Hanging Input', 50);
      vi.advanceTimersByTime(60);
      await expect(promise).rejects.toThrow('Places autocomplete timed out');
      vi.useRealTimers();
    });
  });

  describe('fetchPlaceAddress', () => {
    it('returns empty string if google.maps is not available', async () => {
      expect(await fetchPlaceAddress('p-123')).toBe('');
    });

    it('rejects with timeout when fetchPlaceAddress neither resolves nor rejects', async () => {
      vi.useFakeTimers();
      (window as unknown as { google: unknown }).google = {
        maps: {
          importLibrary: vi.fn().mockImplementation(() => new Promise(() => {})),
        },
      };
      const promise = fetchPlaceAddress('hanging-place', 50);
      vi.advanceTimersByTime(60);
      await expect(promise).rejects.toThrow('Place details timed out');
      vi.useRealTimers();
    });

    it('uses importLibrary Place when available', async () => {
      class MockPlace {
        id: string;
        formattedAddress = '999 Resolved Address';
        fetchFields = vi.fn().mockResolvedValue({});
        constructor({ id }: { id: string }) {
          this.id = id;
        }
      }

      (window as unknown as { google: unknown }).google = {
        maps: {
          importLibrary: vi.fn().mockResolvedValue({
            Place: MockPlace,
          }),
        },
      };

      const addr = await fetchPlaceAddress('p-resolved');
      expect(addr).toBe('999 Resolved Address');
    });

    it('uses PlacesService when importLibrary is not available', async () => {
      class MockPlacesService {
        getDetails = vi.fn((opts, cb) => cb({ formatted_address: '100 Service Way' }, 'OK'));
      }

      (window as unknown as { google: unknown }).google = {
        maps: {
          places: {
            PlacesServiceStatus: { OK: 'OK' },
            PlacesService: MockPlacesService,
          },
        },
      };

      const addr = await fetchPlaceAddress('p-service');
      expect(addr).toBe('100 Service Way');
    });

    it('returns empty string when PlacesService status is not OK', async () => {
      class MockPlacesService {
        getDetails = vi.fn((opts, cb) => cb(null, 'NOT_FOUND'));
      }

      (window as unknown as { google: unknown }).google = {
        maps: {
          places: {
            PlacesServiceStatus: { OK: 'OK' },
            PlacesService: MockPlacesService,
          },
        },
      };

      const addr = await fetchPlaceAddress('p-notfound');
      expect(addr).toBe('');
    });
  });

  describe('withTimeout', () => {
    it('resolves when inner promise resolves before timeout', async () => {
      const res = await withTimeout(Promise.resolve('completed'), 500);
      expect(res).toBe('completed');
    });

    it('rejects when inner promise hangs beyond timeout', async () => {
      vi.useFakeTimers();
      const promise = withTimeout(new Promise(() => {}), 100, 'Custom timeout');
      vi.advanceTimersByTime(120);
      await expect(promise).rejects.toThrow('Custom timeout');
      vi.useRealTimers();
    });
  });
});
