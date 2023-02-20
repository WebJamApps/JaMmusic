import renderer from 'react-test-renderer';
import { WideOrNarrow, Homepage } from 'src/containers/Homepage';

describe('Homepage', () => {
  it('renders Homepage', () => {
    const homepage = renderer.create(<Homepage />).toJSON();
    expect(homepage).toMatchSnapshot();
  });
  it('renders WideAboutUs', () => {
    const wideOrNarrow:any = renderer.create(<WideOrNarrow width={1005} />).toJSON();
    expect(wideOrNarrow.props.className.includes('wideHome')).toBe(true);
  });
});
