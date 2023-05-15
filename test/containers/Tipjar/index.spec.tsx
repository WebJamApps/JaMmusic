import { Tipjar } from 'src/containers/Tipjar';
import { render, queryByAttribute } from '@testing-library/react';
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom';

describe('SortContainer', () => {
  it('renders correctly', () => {
    const tj = renderer.create(<Tipjar />).toJSON();
    expect(tj).toMatchSnapshot();
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
