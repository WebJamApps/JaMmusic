import { Songs } from 'src/containers/Songs';
import renderer from 'react-test-renderer';

describe('Songs', () => {
  it('renders correctly', () => {
    const s = renderer.create(<Songs />).toJSON();
    expect(s).toMatchSnapshot();
  });
});
