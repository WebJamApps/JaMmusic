import renderer from 'react-test-renderer';
import { WideOrNarrow } from 'src/containers/Homepage';

describe('Homepage', () => {
  it('renders WideAboutUs', () => {
    const wideOrNarrow:any = renderer.create(<WideOrNarrow width={1005} />).toJSON();
    expect(wideOrNarrow.props.className.includes('wideHome')).toBe(true);
  });
});
