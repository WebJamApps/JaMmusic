import type { ReactNode, ChangeEvent } from 'react';
import type { AddressSuggestion } from 'src/containers/AdminVenues/venue-address-lookup';

interface AddressAutocompleteProps {
  inputValue: string; options: AddressSuggestion[]; disabled: boolean;
  onInputChange: (event: unknown, value: string, reason: string) => void;
  onChange: (event: unknown, value: AddressSuggestion) => void;
  renderInput: (params: Record<string, unknown>) => ReactNode;
}
export function AddressAutocompleteMock(props: AddressAutocompleteProps) {
  return (
    <div>
      {props.renderInput({
        value: props.inputValue, disabled: props.disabled,
        onChange: (event: ChangeEvent<HTMLInputElement>) => props.onInputChange(event, event.target.value, 'input'),
      })}
      {props.options.map((option) => <button key={option.placeId} onClick={(event) => props.onChange(event, option)}>{option.text}</button>)}
    </div>
  );
}
