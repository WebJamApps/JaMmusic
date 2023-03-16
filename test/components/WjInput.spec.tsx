import { WjInput } from 'src/components/WjInput';
import renderer from 'react-test-renderer';

describe('WjDropdown', () => {
  it('renders when not isRequired', () => {
    const props = { label: 'label' };
    const wji:any = renderer.create(<WjInput {...props} />).toJSON();
    expect(wji.props.placeholder).toBe('label');
  });
});
