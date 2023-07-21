import { BookUs } from 'src/containers/BookUs';
import renderer from 'react-test-renderer';

describe('Bookus', () => {
  it('renders correctly', () => {
    const bu = renderer.create(<BookUs />).toJSON();
    expect(bu).toMatchSnapshot();
  });
  it('renders and handles click', () => {
    window.open = jest.fn();
    const bu = renderer.create(<BookUs />).root;
    bu.findByProps({ size: 'small' }).props.onClick();
    expect(window.open).toHaveBeenCalled();
  });
});
