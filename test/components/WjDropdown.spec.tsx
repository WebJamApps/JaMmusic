import { render, fireEvent } from '@testing-library/react';
import { WjDropdown } from 'src/components/WjDropdown';

describe('WjDropdown', () => {
  it('renders without htmlfor and handles onChange', () => {
    const props = { onChange: vi.fn(), options: [] };
    const { getByRole } = render(<WjDropdown {...props} />);
    fireEvent.change(getByRole('combobox'));
    expect(props.onChange).toHaveBeenCalled();
  });
});
