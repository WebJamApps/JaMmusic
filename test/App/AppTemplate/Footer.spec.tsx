/* eslint-disable @typescript-eslint/no-explicit-any */

import { shallow } from 'enzyme';
import { Footer } from 'src/App/AppTemplate/Footer';

describe('Footer', () => {
  const wrapper = shallow(<Footer />);
  it('renders', () => {
    expect(wrapper.find('div#wjfooter').exists()).toBe(true);
  });
  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
