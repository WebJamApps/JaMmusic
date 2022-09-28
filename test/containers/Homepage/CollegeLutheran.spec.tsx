
import { shallow } from 'enzyme';
import CollegeLutheran from '../../../src/containers/Homepage/CollegeLutheran';

const wrapper = shallow<typeof CollegeLutheran>(<CollegeLutheran />);

describe('CollegeLutheran', () => {
  it('Renders CollegeLutheran', () => {
    expect(wrapper.find('div.elevation2.project').exists()).toBe(true);
    expect(wrapper).toMatchSnapshot();
  });
});
