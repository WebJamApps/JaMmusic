
import { shallow } from 'enzyme';
import Sort from '../../src/containers/SortContainer';

describe('sort container', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any;
  beforeEach(() => {
    wrapper = shallow(<Sort />);
  });
  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
