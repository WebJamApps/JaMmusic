
import { shallow } from 'enzyme';
import HomepageData from '../../../src/containers/Homepage/HomepageData';

const wrapper = shallow<typeof HomepageData>(<HomepageData />);

describe('HomepageData', () => {
  it('Renders the homepageData', () => {
    expect(wrapper.find('div.qAnda').exists()).toBe(true);
    expect(wrapper).toMatchSnapshot();
  });
});
