import { vi } from 'vitest';
import { Tipjar } from 'src/containers/Tipjar';
import { render, queryByAttribute } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('SortContainer', () => {
  it('renders correctly', () => {
    const { container } = render(<Tipjar />);
    expect(container).toBeDefined();
  });
  it('renders and runs useEffect', () => {
    const getById = queryByAttribute.bind(null, 'buy-button-id');
    const dom = render(
      <Tipjar />,
    );
    const stripeButton = getById(dom.container, 'buy_btn_1N6vwFDsYgXB9TLItPPDUXYz');
    expect(typeof stripeButton).toBe('object');
  });
});
