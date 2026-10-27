import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddressSuggestionsPaper } from 'src/containers/AdminVenues/AddressSuggestionsPaper';

it('keeps the official attribution together with the suggestions', () => {
  render(<AddressSuggestionsPaper><div>123 Main Street</div></AddressSuggestionsPaper>);
  expect(screen.getByText('123 Main Street')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Google Maps' })).toHaveAttribute('height', '16');
});
