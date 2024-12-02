import { Homepage } from 'src/containers/Homepage';
import renderer from 'react-test-renderer';

describe('Homepage', () => {
  it('renders correctly', () => {
    const bm = renderer.create(<Homepage />).toJSON();
    expect(bm).toMatchSnapshot();
  });
});
