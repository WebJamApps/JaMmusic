import { render } from '@testing-library/react';
import BuyMusic from 'src/containers/BuyMusic';

describe('BuyMusic', () => {
  it('renders correctly', () => {
    const { container } = render(<BuyMusic />);
    expect(container).toMatchSnapshot();
  });
});
