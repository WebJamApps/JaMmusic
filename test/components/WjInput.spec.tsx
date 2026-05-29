import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WjInput } from 'src/components/WjInput';

describe('WjDropdown', () => {
  it('renders when not isRequired', () => {
    const props = { label: 'label' };
    const { getByPlaceholderText } = render(<WjInput {...props} />);
    expect(getByPlaceholderText('label')).toBeInTheDocument();
  });
});
