import { Songs } from 'src/containers/Songs';
import renderer from 'react-test-renderer';

describe('Songs', () => {
  it('renders correctly', () => {
    const s:any = renderer.create(<Songs />).toJSON();
    expect(s.props.className).toBe('page-content');
  });
});
