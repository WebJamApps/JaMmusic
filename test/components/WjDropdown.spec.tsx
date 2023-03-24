import { WjDropdown } from 'src/components/WjDropdown';
import renderer from 'react-test-renderer';

describe('WjDropdown', () => {
  it('renders without htmlfor and handles onChange', () => {
    const props = { onChange: jest.fn(), options: [] };
    const wjd = renderer.create(<WjDropdown {...props} />).root;
    wjd.findByProps({ multiple: false }).props.onChange();
    expect(props.onChange).toHaveBeenCalled();
  });
});
