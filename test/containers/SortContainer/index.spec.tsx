import { SortContainer } from 'src/containers/SortContainer';
import renderer from 'react-test-renderer';

describe('SortContainer', () => {
  it('renders correctly', () => {
    const sc:any = renderer.create(<SortContainer />).toJSON();
    expect(sc.props.id).toBe('sort-container');
  });
});
