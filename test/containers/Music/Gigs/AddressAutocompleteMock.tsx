import type { ReactNode, ChangeEvent } from 'react';
import type { VenueListingSuggestion } from 'src/containers/AdminVenues/venue-address-lookup';

interface AddressAutocompleteProps {
  inputValue: string;
  options: VenueListingSuggestion[];
  disabled: boolean;
  getOptionLabel?: (option: VenueListingSuggestion) => string;
  onInputChange: (event: unknown, value: string, reason: string) => void;
  onChange: (event: unknown, value: VenueListingSuggestion) => void;
  renderInput: (params: Record<string, unknown>) => ReactNode;
}

export function AddressAutocompleteMock(props: AddressAutocompleteProps) {
  return (
    <div>
      {props.renderInput({
        value: props.inputValue,
        disabled: props.disabled,
        onChange: (event: ChangeEvent<HTMLInputElement>) => props.onInputChange(event, event.target.value, 'input'),
      })}
      {props.options.map((option) => (
        <button key={option.listingId} onClick={(event) => props.onChange(event, option)}>
          {props.getOptionLabel ? props.getOptionLabel(option) : option.name}
        </button>
      ))}
    </div>
  );
}
