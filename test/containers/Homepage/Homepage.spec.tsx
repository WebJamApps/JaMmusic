
import { shallow } from 'enzyme';
import { Homepage } from '../../../src/containers/Homepage';
import WideAboutUs from '../../../src/containers/Homepage/Widescreen/WideAbout';
import NarrowAboutUs from '../../../src/containers/Homepage/Narrowscreen/NarrowAbout';
import WideCurrentProjects from '../../../src/containers/Homepage/Widescreen/WideCurrentProjects';
import WideFacebookFeed from '../../../src/containers/Homepage/Widescreen/WideFacebookFeed';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const targetRef: any = {};
const wrapper = shallow<Homepage>(<Homepage targetRef={targetRef} width={1200} height={1800} />);

describe('Homepage', () => {
  it('Renders the homepage', () => {
    expect(wrapper.find(WideAboutUs).exists()).toBe(true);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find(WideAboutUs).dive().find('div.widescreenHomepage').exists()).toBe(true);
    expect(wrapper.find(WideCurrentProjects).dive().find('div.widescreenHomepage').exists()).toBe(true);
    expect(wrapper.find(WideCurrentProjects).dive().find(WideFacebookFeed).dive()
      .find('div')
      .exists()).toBe(true);
  });
  it('Renders the homepage on cellphone width', () => {
    const wrapper2 = shallow<Homepage>(<Homepage targetRef={targetRef} width={320} height={600} />);
    expect(wrapper2.find(NarrowAboutUs).exists()).toBe(true);
    expect(wrapper2).toMatchSnapshot();
  });
});
