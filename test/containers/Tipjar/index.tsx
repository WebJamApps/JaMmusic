import { Tipjar } from 'src/containers/Tipjar';
import renderer from 'react-test-renderer';

describe('SortContainer', () => {
  it('renders correctly', () => {
    const tj = renderer.create(<Tipjar />).toJSON();
    expect(tj).toMatchSnapshot();
  });
});
