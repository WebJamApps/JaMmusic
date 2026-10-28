let googleMapsPromise: Promise<void> | null = null;

export const UNAVAILABLE_NOTE = "Address suggestions are unavailable. Type the venue's full street address.";
export const GOOGLE_REQUEST_TIMEOUT_MS = 3000;

export interface PlaceSuggestion {
  placeId: string;
  description: string;
}

export function resetGoogleMapsScriptPromise(): void {
  googleMapsPromise = null;
}

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number = GOOGLE_REQUEST_TIMEOUT_MS,
  errorMsg = 'Google Maps request timed out',
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMsg));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

export function loadGoogleMapsScript(apiKey: string, timeoutMs: number = GOOGLE_REQUEST_TIMEOUT_MS): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window unavailable'));
  const maps = (window as unknown as { google?: { maps?: { places?: unknown; importLibrary?: unknown } } }).google?.maps;
  if (maps?.places || maps?.importLibrary) return Promise.resolve();
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    const callbackName = '__googleMapsCallback';
    const win = window as unknown as Record<string, unknown>;

    const cleanup = () => {
      clearTimeout(timeoutId);
      delete win[callbackName];
    };

    const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
      googleMapsPromise = null;
      cleanup();
      script.remove();
      reject(new Error('Google Maps script load timed out'));
    }, timeoutMs);

    win[callbackName] = () => {
      cleanup();
      resolve();
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&loading=async&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      googleMapsPromise = null;
      cleanup();
      script.remove();
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

export async function fetchSuggestions(input: string, timeoutMs: number = GOOGLE_REQUEST_TIMEOUT_MS): Promise<PlaceSuggestion[]> {
  const win = window as unknown as {
    google?: {
      maps?: {
        importLibrary?: (name: string) => Promise<{
          AutocompleteSessionToken?: new () => unknown;
          AutocompleteSuggestion?: {
            fetchAutocompleteSuggestions: (req: { input: string }) => Promise<{
              suggestions?: Array<{
                placePrediction?: {
                  placeId?: string;
                  text?: string | { toString: () => string };
                  description?: string;
                };
              }>;
            }>;
          };
        }>;
        places?: {
          PlacesServiceStatus: { OK: string; ZERO_RESULTS: string };
          AutocompleteService: new () => {
            getPlacePredictions: (
              options: { input: string },
              callback: (results: Array<{ place_id: string; description: string }> | null, status: string) => void,
            ) => void;
          };
        };
      };
    };
  };

  const maps = win.google?.maps;
  if (!maps) throw new Error('Google Maps unavailable');

  const executeFetch = async (): Promise<PlaceSuggestion[]> => {
    if (typeof maps.importLibrary === 'function') {
      try {
        const places = await maps.importLibrary('places');
        if (places?.AutocompleteSuggestion?.fetchAutocompleteSuggestions) {
          const response = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({ input });
          const suggestions = response?.suggestions || [];
          return suggestions.flatMap((item) => {
            const pred = item.placePrediction;
            if (!pred?.placeId) return [];
            const desc = typeof pred.text === 'object' && pred.text !== null && 'toString' in pred.text
              ? pred.text.toString()
              : (typeof pred.text === 'string' ? pred.text : pred.description || '');
            return [{ placeId: pred.placeId, description: desc }];
          });
        }
      } catch (err) {
        if (!maps.places?.AutocompleteService) throw err;
      }
    }

    if (maps.places?.AutocompleteService) {
      return new Promise<PlaceSuggestion[]>((resolve, reject) => {
        const service = new maps.places!.AutocompleteService();
        service.getPlacePredictions({ input }, (results, status) => {
          if (status === maps.places!.PlacesServiceStatus.OK && Array.isArray(results)) {
            resolve(results.map((r) => ({ placeId: r.place_id, description: r.description })));
          } else if (status === maps.places!.PlacesServiceStatus.ZERO_RESULTS) {
            resolve([]);
          } else {
            reject(new Error(`Places autocomplete failed: ${status}`));
          }
        });
      });
    }

    throw new Error('Places library unavailable');
  };

  return withTimeout(executeFetch(), timeoutMs, 'Places autocomplete timed out');
}

export async function fetchPlaceAddress(placeId: string, timeoutMs: number = GOOGLE_REQUEST_TIMEOUT_MS): Promise<string> {
  const win = window as unknown as {
    google?: {
      maps?: {
        importLibrary?: (name: string) => Promise<{
          Place?: new (options: { id: string }) => {
            fetchFields: (options: { fields: string[] }) => Promise<unknown>;
            formattedAddress?: string;
          };
        }>;
        places?: {
          PlacesServiceStatus: { OK: string };
          PlacesService: new (element: HTMLElement) => {
            getDetails: (
              options: { placeId: string; fields: string[] },
              callback: (place: { formatted_address?: string } | null, status: string) => void,
            ) => void;
          };
        };
      };
    };
  };

  const maps = win.google?.maps;
  if (!maps) return '';

  const executeFetch = async (): Promise<string> => {
    if (typeof maps.importLibrary === 'function') {
      try {
        const places = await maps.importLibrary('places');
        if (places?.Place) {
          const place = new places.Place({ id: placeId });
          await place.fetchFields({ fields: ['formattedAddress'] });
          if (place.formattedAddress) return place.formattedAddress;
        }
      } catch {
        // Continue to fallback
      }
    }

    if (maps.places?.PlacesService) {
      return new Promise<string>((resolve) => {
        const dummyDiv = document.createElement('div');
        const service = new maps.places!.PlacesService(dummyDiv);
        service.getDetails({ placeId, fields: ['formatted_address'] }, (place, status) => {
          if (status === maps.places!.PlacesServiceStatus.OK && place?.formatted_address) {
            resolve(place.formatted_address);
          } else {
            resolve('');
          }
        });
      });
    }

    return '';
  };

  return withTimeout(executeFetch(), timeoutMs, 'Place details timed out');
}
