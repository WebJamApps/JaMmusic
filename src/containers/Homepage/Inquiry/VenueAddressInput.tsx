import { useEffect, useRef, useState } from 'react';
import { WjInput } from 'src/components/WjInput';
import type { IinquiryFormData } from '.';
import {
  fetchPlaceAddress,
  fetchSuggestions,
  loadGoogleMapsScript,
  type PlaceSuggestion,
  UNAVAILABLE_NOTE,
} from './googlePlaces';

interface IVenueAddressInputProps {
  formData: IinquiryFormData;
  setFormData: (arg0: IinquiryFormData) => void;
}

export function VenueAddressInput({ formData, setFormData }: IVenueAddressInputProps) {
  const [isFallback, setIsFallback] = useState(false);
  const [inputValue, setInputValue] = useState(formData.venueAddress || '');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const formDataRef = useRef(formData);
  formDataRef.current = formData;
  const setFormDataRef = useRef(setFormData);
  setFormDataRef.current = setFormData;
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setIsFallback(true);
      return () => {
        cancelled = true;
      };
    }
    loadGoogleMapsScript(apiKey).catch(() => {
      if (!cancelled) {
        setIsFallback(true);
        if (formDataRef.current.venueAddress) {
          setFormDataRef.current({
            ...formDataRef.current,
            venuePlaceId: '',
          });
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFallbackChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = evt.target;
    setInputValue(value);
    setFormData({
      ...formData,
      venueAddress: value,
      venuePlaceId: '',
    });
  };

  const handleSuggestionInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = evt.target;
    setInputValue(value);
    setFormData({
      ...formData,
      venuePlaceId: '',
      venueAddress: '',
    });

    clearTimeout(timerRef.current);
    if (value.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      try {
        const results = await fetchSuggestions(value.trim());
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch {
        setIsFallback(true);
        setSuggestions([]);
        setShowSuggestions(false);
        setFormDataRef.current({
          ...formDataRef.current,
          venueAddress: value,
          venuePlaceId: '',
        });
      }
    }, 300);
  };

  const handleSelectSuggestion = async (suggestion: PlaceSuggestion) => {
    clearTimeout(timerRef.current);
    setShowSuggestions(false);
    setSuggestions([]);
    try {
      const formatted = await fetchPlaceAddress(suggestion.placeId);
      const displayAddress = formatted || suggestion.description;
      setInputValue(displayAddress);
      setFormData({
        ...formData,
        venuePlaceId: suggestion.placeId,
        venueAddress: '',
      });
    } catch {
      setInputValue(suggestion.description);
      setFormData({
        ...formData,
        venuePlaceId: suggestion.placeId,
        venueAddress: '',
      });
    }
  };

  if (isFallback) {
    return (
      <div className="venue-address-group" style={{ width: '100%' }}>
        <p
          className="address-suggestions-unavailable-note"
          style={{
            color: '#666',
            fontSize: '0.85rem',
            margin: '4px 0 6px 0',
          }}
        >
          {UNAVAILABLE_NOTE}
        </p>
        <WjInput
          id="venueAddress"
          label="Venue Address"
          isRequired
          type="text"
          value={inputValue}
          onChange={handleFallbackChange}
          style={{ width: '100%' }}
        />
      </div>
    );
  }

  return (
    <div className="venue-address-group" style={{ position: 'relative', width: '100%' }}>
      <WjInput
        id="venueAddress"
        label="Venue Address"
        isRequired
        type="text"
        value={inputValue}
        onChange={handleSuggestionInputChange}
        style={{ width: '100%' }}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div
          id="venue-suggestions-list"
          role="listbox"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            margin: 0,
            padding: 0,
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {suggestions.map((s) => (
            <div
              key={s.placeId}
              role="option"
              aria-selected={false}
              tabIndex={0}
              onClick={() => handleSelectSuggestion(s)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectSuggestion(s);
                }
              }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
                fontSize: '0.9rem',
                color: '#333',
              }}
            >
              {s.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
