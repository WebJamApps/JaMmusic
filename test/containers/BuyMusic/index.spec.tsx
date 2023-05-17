import BuyMusic from 'src/containers/BuyMusic';
import renderer from 'react-test-renderer';

describe('BuyMusic', () => {
  it('renders correctly', () => {
    const bm = renderer.create(<BuyMusic />).toJSON();
    expect(bm).toMatchSnapshot();
  });
});
