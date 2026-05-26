import { render } from '@testing-library/react';
import { Homepage } from 'src/containers/Homepage';

describe('Homepage', () => {
  it('renders correctly', () => {
    const { container } = render(<Homepage />);
    expect(container).toMatchSnapshot();
  });
});
